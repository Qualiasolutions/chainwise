'use client'

import { Button } from "@/components/ui/button"
import { ArrowRight, Download, Heart, Settings, Trash2 } from "lucide-react"

export default function TestComponentsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-bold text-center mb-8">ChainWise Unified Components Test</h1>
      
      {/* Button Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Button Variants</h2>
        
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Primary Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="sm">Small Primary</Button>
            <Button variant="primary" size="md">Medium Primary</Button>
            <Button variant="primary" size="lg">Large Primary</Button>
            <Button variant="primary" size="xl">XL Primary</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Secondary Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary" size="sm">Small Secondary</Button>
            <Button variant="secondary" size="md">Medium Secondary</Button>
            <Button variant="secondary" size="lg">Large Secondary</Button>
            <Button variant="secondary" size="xl">XL Secondary</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Outline Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" size="sm">Small Outline</Button>
            <Button variant="outline" size="md">Medium Outline</Button>
            <Button variant="outline" size="lg">Large Outline</Button>
            <Button variant="outline" size="xl">XL Outline</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Ghost Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="ghost" size="sm">Small Ghost</Button>
            <Button variant="ghost" size="md">Medium Ghost</Button>
            <Button variant="ghost" size="lg">Large Ghost</Button>
            <Button variant="ghost" size="xl">XL Ghost</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Semantic Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="success" size="md">Success</Button>
            <Button variant="destructive" size="md">Destructive</Button>
            <Button variant="link" size="md">Link Button</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Icon Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="icon" aria-label="Settings">
              <Settings size={16} />
            </Button>
            <Button variant="outline" size="icon" aria-label="Download">
              <Download size={16} />
            </Button>
            <Button variant="ghost" size="icon-sm" aria-label="Like">
              <Heart size={14} />
            </Button>
            <Button variant="destructive" size="icon" aria-label="Delete">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Buttons with Icons</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="md">
              Get Started
              <ArrowRight size={16} />
            </Button>
            <Button variant="outline" size="md">
              <Download size={16} />
              Download
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Button States</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="md" disabled>Disabled Primary</Button>
            <Button variant="outline" size="md" disabled>Disabled Outline</Button>
            <Button variant="ghost" size="md" disabled>Disabled Ghost</Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Mobile Test - Full Width</h3>
          <div className="space-y-4 max-w-sm">
            <Button variant="primary" size="lg" className="w-full">
              Full Width Primary
            </Button>
            <Button variant="outline" size="lg" className="w-full">
              Full Width Outline  
            </Button>
          </div>
        </div>
      </section>

      {/* Touch Target Testing */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Touch Target Testing (44px minimum)</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Button variant="primary" size="sm" className="text-xs">
            44px min
          </Button>
          <Button variant="outline" size="icon-sm">
            <Heart size={12} />
          </Button>
          <Button variant="ghost" size="sm">
            Touch Test
          </Button>
          <Button variant="secondary" size="md">
            Perfect Size
          </Button>
        </div>
      </section>

      {/* Accessibility Testing */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Accessibility Testing</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Test keyboard navigation (Tab, Enter, Space) and screen reader compatibility
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" size="md" aria-describedby="help-primary">
              Primary Action
            </Button>
            <Button variant="outline" size="md" aria-label="Close dialog" title="Close dialog">
              ×
            </Button>
            <Button variant="link" size="md">
              Learn more about accessibility
            </Button>
          </div>
          <p id="help-primary" className="text-xs text-gray-500">
            This is the main call-to-action button
          </p>
        </div>
      </section>
    </div>
  )
}