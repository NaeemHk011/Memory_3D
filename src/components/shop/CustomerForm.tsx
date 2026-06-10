import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

interface CustomerFormProps {
  onShippingChange: (price: number) => void;
  onFormChange: (data: any) => void;
}

export function CustomerForm({ onShippingChange, onFormChange }: CustomerFormProps) {
  const [shippingMode, setShippingMode] = useState<"home" | "store">("home");

  const handleModeChange = (mode: "home" | "store") => {
    setShippingMode(mode);
    if (mode === "store") {
      onShippingChange(0);
    }
  };

  return (
    <div className="mt-16 space-y-12">
      {/* Customer Details */}
      <section className="space-y-6">
        <h2 className="text-[12px] tracking-[0.2em] uppercase font-bold text-gold border-b border-gold/20 pb-2">
          Customer Details
        </h2>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Full Name *
            </Label>
            <Input
              id="name"
              placeholder="Enter your full name"
              className="rounded-xl"
              onChange={(e) => onFormChange({ name: e.target.value })}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                className="rounded-xl"
                onChange={(e) => onFormChange({ email: e.target.value })}
              />
              <p className="text-[9px] text-muted-foreground italic">
                We will notify you when your order is ready.
              </p>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="phone"
                className="text-[10px] uppercase tracking-wider text-muted-foreground"
              >
                Phone *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                className="rounded-xl"
                onChange={(e) => onFormChange({ phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="location"
              className="text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              How did you hear about us? (Optional)
            </Label>
            <Textarea
              id="location"
              placeholder="Example: Social media, friend, search engine..."
              className="rounded-xl min-h-[80px]"
            />
          </div>
        </div>
      </section>

      {/* Shipping Details */}
      <section className="space-y-6">
        <h2 className="text-[12px] tracking-[0.2em] uppercase font-bold text-gold border-b border-gold/20 pb-2">
          Shipping Details
        </h2>

        <div className="flex gap-2 p-1.5 bg-muted border border-border rounded-full">
          <button
            onClick={() => handleModeChange("home")}
            className={`flex-1 py-2.5 text-[10px] tracking-[0.2em] uppercase font-bold transition-all duration-300 rounded-full ${
              shippingMode === "home"
                ? "bg-gradient-gold text-white shadow-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Shipping To Home
          </button>
          <button
            onClick={() => handleModeChange("store")}
            className={`flex-1 py-2.5 text-[10px] tracking-[0.2em] uppercase font-bold transition-all duration-300 rounded-full ${
              shippingMode === "store"
                ? "bg-gradient-gold text-white shadow-gold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Collect From Store
          </button>
        </div>

        {shippingMode === "home" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-4 pt-4"
          >
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Country *
              </Label>
              <Select defaultValue="us">
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="us">United States</SelectItem>
                  <SelectItem value="ca">Canada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Street Address *
              </Label>
              <Input placeholder="Enter your street address" className="rounded-xl" />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  City *
                </Label>
                <Input placeholder="Enter your city" className="rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  State / Province *
                </Label>
                <Input placeholder="Enter your state/province" className="rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Zip / Postal Code *
              </Label>
              <Input placeholder="Enter your zip/postal code" className="rounded-xl" />
            </div>

            <div className="space-y-4 pt-4">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Shipping Method *
              </Label>
              <RadioGroup
                defaultValue="standard"
                onValueChange={(val) => onShippingChange(val === "fast" ? 25 : 0)}
              >
                <div className="flex items-center space-x-3 p-4 border border-border rounded-xl bg-card/30 hover:border-gold/30 transition-colors">
                  <RadioGroupItem value="standard" id="s1" className="border-gold text-gold" />
                  <Label htmlFor="s1" className="flex-1 cursor-pointer">
                    <div className="text-[11px] font-bold uppercase tracking-wider">
                      Free Shipping
                    </div>
                    <div className="text-[10px] text-muted-foreground">3-7 business days -  $0</div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border border-border rounded-xl bg-card/30 hover:border-gold/30 transition-colors">
                  <RadioGroupItem value="fast" id="s2" className="border-gold text-gold" />
                  <Label htmlFor="s2" className="flex-1 cursor-pointer">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-gold">
                      Fast Shipping
                    </div>
                    <div className="text-[10px] text-muted-foreground">1-2 business days -  $25</div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </motion.div>
        )}

        {shippingMode === "store" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-6 border border-gold/30 bg-gold/5 rounded-2xl text-center"
          >
            <div className="text-[11px] font-bold uppercase tracking-widest text-gold mb-2">
              Free Store Pickup
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Available in 1-2 business days at our main studio.
            </p>
          </motion.div>
        )}

        <p className="text-[10px] text-muted-foreground italic mt-4">
          * Taxes and Shipping fees are extra
        </p>
      </section>
    </div>
  );
}
