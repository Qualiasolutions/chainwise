"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedCard } from "@/components/ui/enhanced-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HelpCircle,
  MessageSquare,
  Mail,
  Phone,
  FileText,
  ExternalLink,
  Clock,
  CheckCircle,
  AlertTriangle,
  Book,
  Video,
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  subject: string;
  category: string;
  priority: string;
  message: string;
}

export default function SupportPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [ticket, setTicket] = useState<SupportTicket>({
    subject: "",
    category: "",
    priority: "medium",
    message: "",
  });

  const submitTicket = async () => {
    if (!ticket.subject || !ticket.category || !ticket.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      // TODO: Implement support ticket submission API
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay

      toast({
        title: "Support Ticket Submitted",
        description: "We'll get back to you within 24 hours.",
      });

      // Reset form
      setTicket({
        subject: "",
        category: "",
        priority: "medium",
        message: "",
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit support ticket",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const supportCategories = [
    { value: "account", label: "Account & Billing" },
    { value: "technical", label: "Technical Issues" },
    { value: "portfolio", label: "Portfolio Management" },
    { value: "ai", label: "AI Chat & Features" },
    { value: "security", label: "Security & Privacy" },
    { value: "api", label: "API & Integrations" },
    { value: "other", label: "Other" },
  ];

  const priorityLevels = [
    { value: "low", label: "Low", color: "bg-gray-100 text-gray-800" },
    { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
    { value: "high", label: "High", color: "bg-orange-100 text-orange-800" },
    { value: "urgent", label: "Urgent", color: "bg-red-100 text-red-800" },
  ];

  const supportResources = [
    {
      title: "Documentation",
      description: "Comprehensive guides and tutorials",
      icon: Book,
      href: "#",
      color: "text-blue-600",
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      icon: Video,
      href: "#",
      color: "text-purple-600",
    },
    {
      title: "Community Forum",
      description: "Connect with other users",
      icon: Users,
      href: "#",
      color: "text-green-600",
    },
    {
      title: "API Documentation",
      description: "Developer resources and guides",
      icon: FileText,
      href: "#",
      color: "text-orange-600",
    },
  ];

  const faqItems = [
    {
      question: "How do I add cryptocurrencies to my portfolio?",
      answer: "Go to your Portfolio page and click 'Add Holding'. Search for your cryptocurrency and enter your purchase details.",
    },
    {
      question: "What subscription plan do I need for AI features?",
      answer: "Basic AI features are available on the free Buddy plan. Advanced features require Professor ($12.99/month) or Trader ($24.99/month) plans.",
    },
    {
      question: "How is my portfolio data secured?",
      answer: "We use bank-level encryption and never store sensitive information like private keys. All data is encrypted in transit and at rest.",
    },
    {
      question: "Can I export my portfolio data?",
      answer: "Yes, you can export your portfolio data from the Privacy settings page. We'll email you a download link within 24 hours.",
    },
    {
      question: "How accurate are the price feeds?",
      answer: "We use CoinGecko's API for real-time price data, updated every minute. Historical data is also sourced from reliable market data providers.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <EnhancedCard>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <HelpCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <CardTitle>Support Center</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Get help with ChainWise and find answers to common questions
              </p>
            </div>
          </div>
        </CardHeader>
      </EnhancedCard>

      {/* Contact Methods */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <EnhancedCard className="text-center" hover>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold">Live Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Available 24/7 for immediate assistance
                </p>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="w-3 h-3 mr-1" />
                Online
              </Badge>
            </div>
          </CardContent>
        </EnhancedCard>

        <EnhancedCard className="text-center" hover>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold">Email Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get detailed help via email
                </p>
              </div>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                <Clock className="w-3 h-3 mr-1" />
                24h response
              </Badge>
            </div>
          </CardContent>
        </EnhancedCard>

        <EnhancedCard className="text-center" hover>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <Phone className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold">Phone Support</h3>
                <p className="text-sm text-muted-foreground">
                  Priority support for premium users
                </p>
              </div>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                Premium Only
              </Badge>
            </div>
          </CardContent>
        </EnhancedCard>
      </div>

      {/* Submit Ticket */}
      <EnhancedCard>
        <CardHeader>
          <CardTitle>Submit a Support Ticket</CardTitle>
          <p className="text-sm text-muted-foreground">
            Describe your issue and we'll get back to you as soon as possible
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                placeholder="Brief description of your issue"
                value={ticket.subject}
                onChange={(e) => setTicket(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={ticket.category}
                onValueChange={(value) => setTicket(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {supportCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={ticket.priority}
              onValueChange={(value) => setTicket(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    <div className="flex items-center gap-2">
                      <Badge className={level.color}>{level.label}</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message *</Label>
            <Textarea
              id="message"
              placeholder="Please provide detailed information about your issue..."
              rows={5}
              value={ticket.message}
              onChange={(e) => setTicket(prev => ({ ...prev, message: e.target.value }))}
            />
          </div>

          <Button
            onClick={submitTicket}
            disabled={loading}
            className="w-full md:w-auto"
          >
            {loading ? "Submitting..." : "Submit Ticket"}
          </Button>
        </CardContent>
      </EnhancedCard>

      {/* Self-Help Resources */}
      <EnhancedCard>
        <CardHeader>
          <CardTitle>Self-Help Resources</CardTitle>
          <p className="text-sm text-muted-foreground">
            Find quick answers and learn how to use ChainWise effectively
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supportResources.map((resource) => {
              const Icon = resource.icon;
              return (
                <div
                  key={resource.title}
                  className="p-4 border rounded-lg hover:border-purple-300 dark:hover:border-purple-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`w-5 h-5 ${resource.color}`} />
                    <span className="font-medium">{resource.title}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {resource.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </EnhancedCard>

      {/* FAQ Section */}
      <EnhancedCard>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqItems.map((item, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">{item.question}</h3>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button variant="outline">
              View All FAQs
              <ExternalLink className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </EnhancedCard>

      {/* Emergency Contact */}
      <EnhancedCard>
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <h3 className="font-medium text-orange-800 dark:text-orange-200">
                Security Issues or Account Compromise
              </h3>
              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                If you suspect unauthorized access to your account or notice suspicious activity,
                contact our security team immediately at{" "}
                <strong>security@chainwise.ai</strong> or use the emergency contact form.
              </p>
              <Button size="sm" className="mt-3" variant="outline">
                Emergency Contact
              </Button>
            </div>
          </div>
        </CardContent>
      </EnhancedCard>
    </div>
  );
}