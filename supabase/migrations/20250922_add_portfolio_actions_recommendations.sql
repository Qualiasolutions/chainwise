-- Add portfolio actions and recommendations feature
-- Migration: Add actions field and recommendation calculation

-- Add action recommendation field to portfolio holdings
ALTER TABLE portfolio_holdings
ADD COLUMN action_recommendation TEXT CHECK (action_recommendation IN ('buy', 'sell', 'hold')) DEFAULT 'hold',
ADD COLUMN recommendation_reason TEXT,
ADD COLUMN recommendation_confidence DECIMAL(3,2) CHECK (recommendation_confidence >= 0 AND recommendation_confidence <= 1) DEFAULT 0.5;

-- Create function to calculate buy/sell/hold recommendations based on metrics
CREATE OR REPLACE FUNCTION calculate_action_recommendation(
    current_price_param DECIMAL(15,2),
    purchase_price_param DECIMAL(15,2),
    pnl_percentage DECIMAL(10,4)
)
RETURNS TABLE (
    action TEXT,
    reason TEXT,
    confidence DECIMAL(3,2)
) AS $$
DECLARE
    price_change_percentage DECIMAL(10,4);
    action_result TEXT;
    reason_result TEXT;
    confidence_result DECIMAL(3,2);
BEGIN
    SET search_path = '';

    -- Calculate price change percentage
    IF purchase_price_param > 0 THEN
        price_change_percentage := ((current_price_param - purchase_price_param) / purchase_price_param) * 100;
    ELSE
        price_change_percentage := 0;
    END IF;

    -- Determine recommendation based on various factors
    IF price_change_percentage >= 50 THEN
        -- Significant gains - consider taking profits
        action_result := 'sell';
        reason_result := 'Strong gains (+' || ROUND(price_change_percentage, 1) || '%) - consider taking profits';
        confidence_result := 0.8;
    ELSIF price_change_percentage >= 20 THEN
        -- Good gains - hold for more growth
        action_result := 'hold';
        reason_result := 'Good performance (+' || ROUND(price_change_percentage, 1) || '%) - monitor for further growth';
        confidence_result := 0.7;
    ELSIF price_change_percentage <= -30 THEN
        -- Significant losses - consider averaging down
        action_result := 'buy';
        reason_result := 'Oversold (' || ROUND(price_change_percentage, 1) || '%) - potential buying opportunity';
        confidence_result := 0.75;
    ELSIF price_change_percentage <= -15 THEN
        -- Moderate losses - hold and monitor
        action_result := 'hold';
        reason_result := 'Temporary decline (' || ROUND(price_change_percentage, 1) || '%) - hold for recovery';
        confidence_result := 0.6;
    ELSIF price_change_percentage >= -5 AND price_change_percentage <= 5 THEN
        -- Stable price - good for accumulation
        action_result := 'buy';
        reason_result := 'Stable price range - good accumulation opportunity';
        confidence_result := 0.65;
    ELSE
        -- Default to hold for other scenarios
        action_result := 'hold';
        reason_result := 'Market conditions suggest holding current position';
        confidence_result := 0.5;
    END IF;

    RETURN QUERY SELECT action_result, reason_result, confidence_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update all recommendations for a portfolio
CREATE OR REPLACE FUNCTION update_portfolio_recommendations(portfolio_uuid UUID)
RETURNS void AS $$
DECLARE
    holding_record RECORD;
    recommendation_result RECORD;
BEGIN
    SET search_path = '';

    -- Loop through all holdings in the portfolio
    FOR holding_record IN
        SELECT id, current_price, purchase_price
        FROM public.portfolio_holdings
        WHERE portfolio_id = portfolio_uuid
    LOOP
        -- Calculate recommendation for each holding
        SELECT * INTO recommendation_result
        FROM public.calculate_action_recommendation(
            holding_record.current_price,
            holding_record.purchase_price,
            ((holding_record.current_price - holding_record.purchase_price) / holding_record.purchase_price) * 100
        );

        -- Update the holding with recommendation
        UPDATE public.portfolio_holdings
        SET
            action_recommendation = recommendation_result.action,
            recommendation_reason = recommendation_result.reason,
            recommendation_confidence = recommendation_result.confidence,
            updated_at = NOW()
        WHERE id = holding_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically update recommendations when prices change
CREATE OR REPLACE FUNCTION trigger_update_recommendation()
RETURNS TRIGGER AS $$
DECLARE
    recommendation_result RECORD;
BEGIN
    SET search_path = '';

    -- Only update if current_price changed
    IF TG_OP = 'UPDATE' AND (OLD.current_price IS DISTINCT FROM NEW.current_price) THEN
        -- Calculate new recommendation
        SELECT * INTO recommendation_result
        FROM public.calculate_action_recommendation(
            NEW.current_price,
            NEW.purchase_price,
            ((NEW.current_price - NEW.purchase_price) / NEW.purchase_price) * 100
        );

        -- Update recommendation fields
        NEW.action_recommendation := recommendation_result.action;
        NEW.recommendation_reason := recommendation_result.reason;
        NEW.recommendation_confidence := recommendation_result.confidence;
    ELSIF TG_OP = 'INSERT' THEN
        -- Calculate recommendation for new holdings
        SELECT * INTO recommendation_result
        FROM public.calculate_action_recommendation(
            COALESCE(NEW.current_price, NEW.purchase_price),
            NEW.purchase_price,
            0 -- No P&L for new holdings
        );

        NEW.action_recommendation := recommendation_result.action;
        NEW.recommendation_reason := recommendation_result.reason;
        NEW.recommendation_confidence := recommendation_result.confidence;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic recommendation updates
CREATE TRIGGER update_recommendation_on_price_change
    BEFORE INSERT OR UPDATE ON portfolio_holdings
    FOR EACH ROW EXECUTE FUNCTION trigger_update_recommendation();

-- Add index for better performance on action queries
CREATE INDEX idx_portfolio_holdings_action ON portfolio_holdings(action_recommendation);
CREATE INDEX idx_portfolio_holdings_confidence ON portfolio_holdings(recommendation_confidence);

-- Update existing holdings with initial recommendations
-- This will be triggered automatically by the trigger for any existing data