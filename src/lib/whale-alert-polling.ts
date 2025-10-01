import { createClient } from '@supabase/supabase-js';
import { WhaleAlertAPI } from './whale-alert-api';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export class WhaleAlertPollingService {
  private whaleAlert: WhaleAlertAPI;
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.whaleAlert = new WhaleAlertAPI();
    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  /**
   * Poll Whale Alert API for new transactions
   * Should be called every 5 minutes via cron job
   */
  async pollTransactions(): Promise<{ success: boolean; processed: number; errors: string[] }> {
    const errors: string[] = [];
    let processed = 0;

    try {
      // Get last processed timestamp
      const { data: pollingState, error: stateError } = await this.supabase
        .from('whale_alert_polling_state')
        .select('*')
        .limit(1)
        .single();

      if (stateError) {
        errors.push(`Failed to get polling state: ${stateError.message}`);
        return { success: false, processed: 0, errors };
      }

      const lastProcessed = new Date(pollingState.last_processed_timestamp);
      const now = new Date();
      const startTime = Math.floor(lastProcessed.getTime() / 1000);
      const endTime = Math.floor(now.getTime() / 1000);

      // Fetch transactions from each blockchain
      const blockchains = ['bitcoin', 'ethereum', 'tron'] as const;
      const allTransactions: any[] = [];

      for (const blockchain of blockchains) {
        try {
          const transactions = await this.whaleAlert.getTransactions(blockchain, {
            start: startTime,
            end: endTime,
            min_value: 100000 // Minimum $100k USD
          });

          allTransactions.push(...transactions);
        } catch (error: any) {
          errors.push(`Failed to fetch ${blockchain} transactions: ${error.message}`);
        }
      }

      // Store transactions in database
      if (allTransactions.length > 0) {
        const transactionsToInsert = allTransactions.map(tx => ({
          transaction_hash: tx.hash,
          blockchain: tx.blockchain,
          symbol: tx.symbol,
          amount: tx.amount,
          amount_usd: tx.amount_usd,
          from_address: tx.from.address,
          from_owner: tx.from.owner,
          from_owner_type: tx.from.owner_type,
          to_address: tx.to.address,
          to_owner: tx.to.owner,
          to_owner_type: tx.to.owner_type,
          transaction_type: tx.transaction_type,
          transaction_timestamp: new Date(tx.timestamp * 1000).toISOString(),
          is_significant: true,
          metadata: tx
        }));

        const { data: insertedTxs, error: insertError } = await this.supabase
          .from('whale_transactions_feed')
          .upsert(transactionsToInsert, {
            onConflict: 'transaction_hash',
            ignoreDuplicates: true
          })
          .select();

        if (insertError) {
          errors.push(`Failed to insert transactions: ${insertError.message}`);
        } else {
          processed = insertedTxs?.length || 0;

          // Create notifications for subscribed users
          if (insertedTxs && insertedTxs.length > 0) {
            await this.createNotifications(insertedTxs);
          }
        }
      }

      // Update polling state
      await this.supabase
        .from('whale_alert_polling_state')
        .update({
          last_processed_timestamp: now.toISOString(),
          last_transaction_hash: allTransactions[allTransactions.length - 1]?.hash || null,
          transactions_processed: (pollingState.transactions_processed || 0) + processed,
          last_error: errors.length > 0 ? errors.join('; ') : null,
          updated_at: now.toISOString()
        })
        .eq('id', pollingState.id);

      return {
        success: errors.length === 0,
        processed,
        errors
      };

    } catch (error: any) {
      errors.push(`Polling error: ${error.message}`);
      return { success: false, processed: 0, errors };
    }
  }

  /**
   * Create notifications for users based on their subscription preferences
   */
  private async createNotifications(transactions: any[]): Promise<void> {
    try {
      // Get all active subscriptions
      const { data: subscriptions, error: subError } = await this.supabase
        .from('whale_alert_subscriptions')
        .select('user_id, notification_preferences')
        .eq('is_active', true);

      if (subError || !subscriptions) {
        console.error('Failed to get subscriptions:', subError);
        return;
      }

      // Get user details
      const userIds = subscriptions.map(s => s.user_id);
      const { data: users, error: userError } = await this.supabase
        .from('users')
        .select('id, email, tier')
        .in('id', userIds)
        .eq('tier', 'elite'); // Only elite users

      if (userError || !users) {
        console.error('Failed to get users:', userError);
        return;
      }

      const userMap = new Map(users.map(u => [u.id, u]));

      // Match transactions to user preferences
      const notificationsToCreate: any[] = [];
      const whaleNotificationsToCreate: any[] = [];

      for (const sub of subscriptions) {
        const user = userMap.get(sub.user_id);
        if (!user) continue;

        const prefs = sub.notification_preferences;

        // Check quiet hours
        if (prefs.quiet_hours?.enabled) {
          const now = new Date();
          const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
          if (currentTime >= prefs.quiet_hours.start && currentTime <= prefs.quiet_hours.end) {
            continue; // Skip during quiet hours
          }
        }

        // Filter transactions based on preferences
        const matchingTxs = transactions.filter(tx => {
          if (parseFloat(tx.amount_usd) < prefs.min_usd_value) return false;
          if (!prefs.blockchains.includes(tx.blockchain)) return false;
          if (!prefs.transaction_types.includes(tx.transaction_type)) return false;
          return true;
        });

        // Create notifications for matching transactions
        for (const tx of matchingTxs) {
          // Create in-app notification
          if (prefs.notification_channels.includes('in_app')) {
            const direction = tx.from_owner ? `${tx.from_owner} → ${tx.to_owner || 'Unknown'}` :
                              tx.to_owner ? `Unknown → ${tx.to_owner}` :
                              'Unknown → Unknown';

            notificationsToCreate.push({
              user_id: sub.user_id,
              type: 'whale_alert',
              title: `🐋 ${formatCurrency(parseFloat(tx.amount_usd))} ${tx.symbol} Transaction`,
              message: `${direction} on ${capitalize(tx.blockchain)}`,
              data: {
                transaction_id: tx.id,
                hash: tx.transaction_hash,
                blockchain: tx.blockchain,
                amount: tx.amount,
                amount_usd: tx.amount_usd,
                timestamp: tx.transaction_timestamp
              }
            });

            whaleNotificationsToCreate.push({
              user_id: sub.user_id,
              transaction_id: tx.id,
              is_read: false,
              is_archived: false
            });
          }
        }
      }

      // Insert notifications
      if (notificationsToCreate.length > 0) {
        const { data: createdNotifs, error: notifError } = await this.supabase
          .from('notifications')
          .insert(notificationsToCreate)
          .select();

        if (notifError) {
          console.error('Failed to create notifications:', notifError);
        } else if (createdNotifs) {
          // Link notifications to whale transactions
          const linkedNotifications = whaleNotificationsToCreate.map((wn, i) => ({
            ...wn,
            notification_id: createdNotifs[i]?.id
          }));

          await this.supabase
            .from('whale_alert_notifications')
            .insert(linkedNotifications);
        }
      }

    } catch (error) {
      console.error('Failed to create notifications:', error);
    }
  }
}

// Helper functions
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  return `$${(value / 1000).toFixed(0)}K`;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Export singleton instance
export const whaleAlertPolling = new WhaleAlertPollingService();
