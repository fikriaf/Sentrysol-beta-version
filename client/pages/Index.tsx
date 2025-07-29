import { Search, X, Shield, Eye, Bug, Menu } from "lucide-react";
import { useState } from "react";

export default function Index() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen main-gradient relative">
      {/* Background Pattern */}
      <div className="absolute top-0 left-0 w-full h-full z-[1] opacity-30">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/c825e8e63e3c0adb94bef5f03f13e3ea4131deac?width=3842"
          alt="Line pattern background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 w-[calc(100%-2rem)] max-w-6xl h-auto z-50 px-4">
        <div className="flex flex-col md:flex-row items-center justify-between w-full h-auto px-4 py-4 rounded-3xl md:rounded-full border border-white/10 bg-white/10 backdrop-blur-sm gap-4 md:gap-0">
          {/* Mobile Logo */}
          <div className="flex items-center gap-3 md:hidden">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/3249d81bd5a0516fe5c613581be785b53ef9877e?width=130"
              alt="SentrySol Logo"
              className="w-8 h-8"
            />
            <span className="text-white font-poppins text-xl font-bold leading-none">
              SENTRYSOL
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between w-full h-auto gap-4 md:gap-0">
            {/* Desktop Logo and Navigation */}
            <div className="hidden md:flex items-center gap-8 lg:gap-12">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/3249d81bd5a0516fe5c613581be785b53ef9877e?width=130"
                  alt="SentrySol Logo"
                  className="w-10 h-10"
                />
                <span className="text-white font-poppins text-2xl lg:text-3xl font-bold leading-none">
                  SENTRYSOL
                </span>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-6 lg:gap-8">
                <a
                  href="#"
                  className="text-white font-poppins text-lg font-normal leading-none hover:text-white/80 transition-colors"
                >
                  Products
                </a>
                <a
                  href="#"
                  className="text-white font-poppins text-lg font-normal leading-none hover:text-white/80 transition-colors"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-white font-poppins text-lg font-normal leading-none hover:text-white/80 transition-colors"
                >
                  Docs
                </a>
                <a
                  href="#"
                  className="text-white font-poppins text-lg font-normal leading-none hover:text-white/80 transition-colors"
                >
                  Pricing
                </a>
                <button className="bg-white text-black font-poppins text-lg font-normal leading-none px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
                  Connect
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden relative">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-white p-2"
              >
                <Menu className="w-6 h-6" />
              </button>
              {isMobileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 bg-black/90 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex flex-col gap-4 min-w-[200px]">
                  <a
                    href="#"
                    className="text-white font-poppins hover:text-white/80 transition-colors"
                  >
                    Products
                  </a>
                  <a
                    href="#"
                    className="text-white font-poppins hover:text-white/80 transition-colors"
                  >
                    About
                  </a>
                  <a
                    href="#"
                    className="text-white font-poppins hover:text-white/80 transition-colors"
                  >
                    Docs
                  </a>
                  <a
                    href="#"
                    className="text-white font-poppins hover:text-white/80 transition-colors"
                  >
                    Pricing
                  </a>
                  <button className="bg-white text-black font-poppins text-sm font-normal leading-none px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
                    Connect
                  </button>
                </div>
              )}
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-64 h-10">
              <div className="absolute inset-0 rounded-full border border-white/47 shadow-[0px_4px_0px_rgba(0,0,0,0.25)]"></div>
              <input
                type="text"
                placeholder="I'm looking for..."
                className="absolute inset-0 bg-transparent text-white placeholder-white/60 px-4 rounded-full text-sm focus:outline-none"
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Search className="w-4 h-4 text-white/35" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-[2] pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Secure. Smart. Private. */}
          <div className="text-white font-poppins text-lg font-normal leading-none mb-8">
            Secure. Smart. Private.
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="space-y-8">
              {/* Main Heading */}
              <h1 className="font-poppins text-4xl sm:text-6xl lg:text-8xl font-bold leading-tight uppercase gradient-text">
                SENTRYSOL
              </h1>

              {/* Description and CTA */}
              <div className="space-y-6">
                <p className="text-white font-poppins text-lg font-normal leading-relaxed max-w-md">
                  SentrySol is an AI-native, on-device behavioral security
                  framework built specifically for Web3 mobile environments,
                  initially focusing on Solana Mobile Seeker.
                </p>
                <button className="bg-sentry-sage text-black font-poppins text-lg font-normal leading-none px-6 py-3 rounded-full hover:bg-sentry-sage/90 transition-colors">
                  Get Started
                </button>
              </div>
            </div>

            {/* Right side - Logo */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-80 h-80 lg:w-96 lg:h-96">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/63d4f60c2a192a08d444bc9ff2880fed32d0e0c0?width=1519"
                  alt="SentrySol logo glow"
                  className="absolute inset-0 w-full h-full object-contain"
                />
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/cdd82043a412ca71168235cfa284d856822ce355?width=1519"
                  alt="SentrySol logo"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 02 - Intelligent Protection */}
      <section className="relative z-[2] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center font-poppins text-3xl sm:text-5xl lg:text-7xl font-normal leading-tight tracking-wide gradient-section-text mb-8">
            Intelligent Protection Right On Your Phone
          </h2>

          <p className="text-white text-center font-poppins text-xl font-normal leading-relaxed tracking-wide max-w-4xl mx-auto mb-16">
            We introduce an AI-native, on-device behavioral security framework
            specifically engineered to protect your Web3 mobile experience.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Card 1 - Your Data Private */}
            <div className="relative h-96 md:h-[450px]">
              <div className="relative w-full h-full rounded-3xl border-2 border-white/30 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-sentry-sage to-sentry-blue-gray flex items-center justify-center mb-8">
                  <Shield className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-white font-poppins text-3xl font-normal leading-tight mb-6">
                  Your Data Private
                </h3>
                <p className="text-white font-poppins text-lg font-normal leading-relaxed">
                  Your behavioral data never leaves your device. Security
                  remains active, even when you're offline.
                </p>
              </div>
            </div>

            {/* Card 2 - Spots Suspicious */}
            <div className="relative h-96 md:h-[450px] md:-mt-8">
              <div className="relative w-full h-full rounded-3xl border-2 border-white/30 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-sentry-sage to-sentry-blue-gray flex items-center justify-center mb-8">
                  <Eye className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-white font-poppins text-3xl font-normal leading-tight mb-6">
                  Spots Suspicious
                </h3>
                <p className="text-white font-poppins text-lg font-normal leading-relaxed">
                  Guards against phishing, malicious smart contracts, and wallet
                  draining.
                </p>
              </div>
            </div>

            {/* Card 3 - Stop Threats */}
            <div className="relative h-96 md:h-[450px]">
              <div className="relative w-full h-full rounded-3xl border-2 border-white/30 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-8 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-b from-sentry-sage to-sentry-blue-gray flex items-center justify-center mb-8">
                  <Bug className="w-10 h-10 text-black" />
                </div>
                <h3 className="text-white font-poppins text-3xl font-normal leading-tight mb-6">
                  Stop Threats
                </h3>
                <p className="text-white font-poppins text-lg font-normal leading-relaxed">
                  Instant threat detection without network delays. Our system
                  continuously adapts to new threats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 03 - Revolutionizing Web3 Mobile Security */}
      <section className="relative z-[2] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-white text-center font-poppins text-3xl sm:text-5xl lg:text-7xl font-normal leading-tight mb-8">
            Revolutionizing Web3 Mobile Security
          </h2>

          <p className="text-white text-center font-poppins text-xl font-normal leading-relaxed tracking-wide max-w-3xl mx-auto mb-16">
            SentrySol is strategically focused on the Solana Mobile ecosystem,
            providing native, enhanced dApp security directly integrated with
            devices like the Solana Seeker.
          </p>

          {/* Feature Diagram */}
          <div className="relative max-w-6xl mx-auto">
            {/* Central blur circle */}
            <div className="hidden md:block absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-white/8 shadow-[0px_4px_4px_66px_rgba(0,0,0,0.25)] blur-[62px]"></div>

            {/* Feature Labels - Grid layout */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="bg-black/20 rounded-2xl px-4 py-3 text-white font-poppins text-lg font-normal">
                Phishing Interceptor
              </div>
              <div className="bg-black/20 rounded-2xl px-4 py-3 text-white font-abc-diatype text-lg font-bold">
                Privacy-Preserving
              </div>
              <div className="bg-black/20 rounded-2xl px-4 py-3 text-white font-poppins text-lg font-normal">
                Hardware-Level Security
              </div>
              <div className="bg-black/20 rounded-2xl px-4 py-3 text-white font-poppins text-lg font-normal">
                Trusted Execution Environment
              </div>
              <div className="bg-black/20 rounded-2xl px-4 py-3 text-white font-poppins text-lg font-normal">
                Anomaly Detection Engine
              </div>
              <div className="bg-black/20 rounded-2xl px-4 py-3 text-white font-poppins text-lg font-normal">
                On-Device Processing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 04 - Vision and Mission */}
      <section className="relative z-[2] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Vision */}
            <div className="space-y-8">
              <h2 className="text-white font-poppins text-4xl sm:text-6xl lg:text-7xl font-normal leading-tight">
                Vision
              </h2>
              <p className="text-white font-poppins text-xl font-normal leading-relaxed tracking-wide">
                We envision a Web3 future where users interact with
                decentralized applications confidently and securely. SentrySol
                is building the essential, intelligent, and privacy-preserving
                security layer needed to unlock the full potential of Web3 on
                mobile devices.
              </p>
            </div>

            {/* Mission */}
            <div className="space-y-8">
              <h2 className="text-white font-poppins text-4xl sm:text-6xl lg:text-7xl font-normal leading-tight">
                Mission
              </h2>
              <p className="text-white font-poppins text-xl font-normal leading-relaxed tracking-wide">
                Empowering Users, Fostering trust and confidence in every Web3
                interaction. Securing the Ecosystem, Protecting against evolving
                threats like blind signing and wallet draining. Driving
                Adoption, Making Web3 accessible and safe for everyone.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 05 - Seamless Integration */}
      <section className="relative z-[2] py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-center font-poppins text-3xl sm:text-5xl lg:text-7xl font-normal leading-tight tracking-wide gradient-section-text mb-16">
            Seamless Integration for Enhanced Security.
          </h2>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/be7adfd84f304d55c0a85f977267b56af7b1a83a?width=1846"
                alt="Solana Seeker phone"
                className="w-full max-w-md mx-auto h-auto object-contain"
              />
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <p className="text-white font-poppins text-xl font-normal leading-relaxed tracking-wide">
                SentrySol is strategically focused on the Solana Mobile
                ecosystem, providing native, enhanced dApp security directly
                integrated with devices like the Solana Seeker.
              </p>

              <button className="bg-sentry-accent/20 text-white font-poppins text-lg font-normal leading-none px-8 py-4 rounded-full hover:bg-sentry-accent/30 transition-colors">
                Read More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 06 - Soon On Seeker */}
      <section className="relative z-[2] py-20 px-4">
        {/* Animation Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden opacity-30">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/3062c5637282367d8b1d3011ade4eeae1ca4cbaf?width=3840"
            alt="Wave animation 1"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/4c4f4e121a62703a20a087eb92ff9c1ad2a18eb5?width=3840"
            alt="Wave animation 2"
            className="absolute left-0 top-0 w-full h-1/2 object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto text-center space-y-12">
          <p className="text-white font-poppins text-2xl sm:text-3xl lg:text-4xl font-normal leading-relaxed tracking-wide max-w-5xl mx-auto">
            We're building the future of Web3 mobile security, a future where
            you're always protected.
          </p>

          <button className="bg-sentry-accent/20 border border-white/24 text-white font-poppins text-lg font-normal leading-none px-8 py-4 rounded-full hover:bg-sentry-accent/30 transition-colors">
            Start Now
          </button>

          <h2 className="text-white font-poppins text-4xl sm:text-6xl lg:text-8xl font-normal leading-tight tracking-wide">
            Soon On
          </h2>

          <div className="space-y-8">
            <div className="flex justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/ce913d73bf4273f828f4376a9e6e3b3cb247c0e5?width=1997"
                alt="Seeker isolated"
                className="w-full max-w-2xl h-auto object-contain"
              />
            </div>

            <div className="flex justify-center">
              <img
                src="https://api.builder.io/api/v1/image/assets/TEMP/14cd9f3ea7854a53575926aa3d38067d0d9147e1?width=760"
                alt="Solana dApp Store Badge"
                className="w-full max-w-md h-auto object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-[2] bg-sentry-footer">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Logo and Description */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/7a2765d9790496907d7a42bab916df1a729b35e2?width=78"
                  alt="SentrySol Logo"
                  className="w-10 h-10"
                />
                <span className="text-white font-poppins text-xl font-bold leading-none">
                  SENTRYSOL
                </span>
              </div>

              <p className="text-white/70 font-poppins text-base font-normal leading-relaxed max-w-md">
                SentrySol is an AI-native, on-device behavioral security
                framework built specifically for Web3 mobile environments,
                initially focusing on Solana Mobile Seeker.
              </p>

              {/* Social Icons */}
              <div className="flex gap-4">
                <div className="w-12 h-12">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 54 54"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="26.6667"
                      cy="26.6667"
                      r="25.9167"
                      fill="url(#paint0_linear)"
                      stroke="url(#paint1_linear)"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M38.2615 19.0621C37.3381 19.4627 36.3617 19.7275 35.3624 19.8483C36.4166 19.2185 37.2066 18.2278 37.5859 17.0598C36.5952 17.6496 35.5108 18.065 34.3797 18.2882C33.6237 17.4684 32.6169 16.9226 31.5173 16.7366C30.4177 16.5506 29.2874 16.7348 28.3038 17.2603C27.3201 17.7859 26.5387 18.623 26.0821 19.6405C25.6255 20.658 25.5196 21.7983 25.7809 22.8825C23.7779 22.7812 21.8186 22.2596 20.0303 21.3517C18.242 20.4438 16.6647 19.1699 15.4008 17.6126C14.9576 18.3867 14.7246 19.2634 14.7252 20.1554C14.7236 20.9838 14.9269 21.7998 15.317 22.5306C15.7071 23.2615 16.2718 23.8845 16.9609 24.3443C16.16 24.3225 15.3761 24.1076 14.6761 23.7178V23.7792C14.6821 24.9399 15.0888 26.0629 15.8275 26.9583C16.5662 27.8537 17.5914 28.4664 18.7298 28.6929C18.2916 28.8262 17.8366 28.8965 17.3786 28.9017C17.0615 28.898 16.7452 28.8692 16.4327 28.8157C16.7569 29.8142 17.3843 30.6867 18.2275 31.312C19.0707 31.9373 20.0879 32.2842 21.1375 32.3044C19.3652 33.6989 17.177 34.46 14.9218 34.4664C14.5112 34.4677 14.1009 34.4431 13.6934 34.3927C15.9959 35.8793 18.6792 36.6686 21.42 36.6652C23.3114 36.6849 25.1877 36.3274 26.9394 35.6138C28.6911 34.9002 30.283 33.8446 31.6222 32.5089C32.9614 31.1731 34.021 29.5839 34.7391 27.8341C35.4572 26.0842 35.8195 24.2088 35.8047 22.3174C35.8047 22.1086 35.8047 21.8875 35.8047 21.6664C36.7686 20.9475 37.6 20.0663 38.2615 19.0621Z"
                      fill="white"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear"
                        x1="26.6667"
                        y1="0"
                        x2="26.6667"
                        y2="53.3333"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="white" stopOpacity="0.05" />
                        <stop offset="1" stopColor="white" stopOpacity="0" />
                      </linearGradient>
                      <linearGradient
                        id="paint1_linear"
                        x1="26.6667"
                        y1="-1.41844"
                        x2="55.3192"
                        y2="24.4537"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="white" stopOpacity="0.3" />
                        <stop
                          offset="0.545"
                          stopColor="white"
                          stopOpacity="0.05"
                        />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>

            {/* Explore */}
            <div className="space-y-6">
              <h3 className="text-white font-poppins text-lg font-bold leading-tight">
                Explore
              </h3>
              <div className="space-y-4">
                <a
                  href="#"
                  className="block text-white/70 font-poppins text-base font-normal leading-relaxed hover:text-white transition-colors"
                >
                  Press & Media
                </a>
                <a
                  href="#"
                  className="block text-white/70 font-poppins text-base font-normal leading-relaxed hover:text-white transition-colors"
                >
                  Community
                </a>
                <a
                  href="#"
                  className="block text-white/70 font-poppins text-base font-normal leading-relaxed hover:text-white transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>

            {/* Resources */}
            <div className="space-y-6">
              <h3 className="text-white font-poppins text-lg font-bold leading-tight">
                Resources
              </h3>
              <div className="space-y-4">
                <a
                  href="#"
                  className="block text-white/70 font-poppins text-base font-normal leading-relaxed hover:text-white transition-colors"
                >
                  Whitepaper
                </a>
                <a
                  href="#"
                  className="block text-white/70 font-poppins text-base font-normal leading-relaxed hover:text-white transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="#"
                  className="block text-white/70 font-poppins text-base font-normal leading-relaxed hover:text-white transition-colors"
                >
                  Integration
                </a>
                <a
                  href="#"
                  className="block text-white/70 font-poppins text-base font-normal leading-relaxed hover:text-white transition-colors"
                >
                  Blog
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="mt-16 pt-8 border-t border-white/15">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-white font-poppins text-xl font-bold leading-tight mb-4">
                  Join our Newsletter
                </h3>
                <div className="flex gap-4">
                  <input
                    type="email"
                    placeholder="Enter Your Email"
                    className="flex-1 h-12 bg-white/2 rounded-xl px-4 text-white placeholder-white/60 border border-white/10 focus:outline-none focus:border-white/30"
                  />
                  <button className="bg-gradient-to-b from-white/12 to-transparent border border-transparent text-white font-poppins text-base font-normal leading-none px-6 py-3 rounded-xl hover:from-white/20 transition-all">
                    Submit
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <span className="text-white/70 font-poppins text-base font-normal">
                  SentrySol, 2025
                </span>
                <a
                  href="#"
                  className="text-white/70 font-poppins text-base font-normal hover:text-white transition-colors"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
