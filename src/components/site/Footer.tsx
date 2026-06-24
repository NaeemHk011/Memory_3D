import { Link } from "@tanstack/react-router";
import { Instagram, Facebook, Mail, Phone, MapPin } from "lucide-react";
import logo from "@/assets/Memory_3D_Logo (1) (3).png";

export function Footer() {
  return (
    <footer className="bg-[#0a0a0a] mt-0">
      <div className="h-[2px] bg-gradient-gold opacity-85" />

      <div className="max-w-7xl mx-auto px-6 lg:px-10 pt-24 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-6">
              <img
                src={logo}
                alt="Memory3D Logo"
                className="h-12 w-auto brightness-0 invert"
              />
            </div>
            <p className="text-sm text-white/38 leading-relaxed max-w-xs">
              Capturing your most precious moments inside premium laser-engraved crystal.
            </p>
          </div>

          {/* Shop links */}
          <div>
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-gold mb-5 font-semibold">
              Shop
            </h4>
            <ul className="space-y-3 text-sm text-white/42">
              <li>
                <Link to="/shop" className="hover:text-gold transition-colors duration-200">
                  3D Crystals
                </Link>
              </li>
              <li>
                <Link to="/acrylic-prints" className="hover:text-gold transition-colors duration-200">
                  Acrylic Prints
                </Link>
              </li>
              <li>
                <Link to="/canvas-prints" className="hover:text-gold transition-colors duration-200">
                  Canvas Prints
                </Link>
              </li>
              <li>
                <Link to="/sculptures" className="hover:text-gold transition-colors duration-200">
                  3D Sculptures
                </Link>
              </li>
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-gold mb-5 font-semibold">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-white/42">
              <li>
                <Link to="/about" className="hover:text-gold transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors duration-200">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-gold transition-colors duration-200">
                  Schedule a Scan
                </Link>
              </li>
              <li>
                <Link to="/affiliates" className="hover:text-gold transition-colors duration-200">
                  Affiliates
                </Link>
              </li>
            </ul>
          </div>

          {/* Studio info */}
          <div>
            <h4 className="text-[11px] tracking-[0.25em] uppercase text-gold mb-5 font-semibold">
              Studio
            </h4>
            <ul className="space-y-3 text-sm text-white/42">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 mt-1 text-gold shrink-0" />
                Nationwide pop-up scans
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-3.5 h-3.5 mt-1 text-gold shrink-0" />
                support@memory3d.com
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-3.5 h-3.5 mt-1 text-gold shrink-0" />
                888-936-3667
              </li>
            </ul>
            <div className="flex gap-3 mt-6">
              <a
                aria-label="Instagram"
                href="#"
                className="w-9 h-9 grid place-items-center border border-white/[0.12] hover:border-gold hover:text-gold transition-all duration-200 rounded-full text-white/30 hover:bg-gold/5"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                aria-label="Facebook"
                href="#"
                className="w-9 h-9 grid place-items-center border border-white/[0.12] hover:border-gold hover:text-gold transition-all duration-200 rounded-full text-white/30 hover:bg-gold/5"
              >
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/22">
          <p>© {new Date().getFullYear()} Memory3D. Forever in crystal.</p>
          <p className="tracking-[0.2em] uppercase">Premium · Personalized · Forever</p>
        </div>
      </div>
    </footer>
  );
}
