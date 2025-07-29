import { Search, X, Shield, Eye, Bug, Menu } from "lucide-react";
import { useState } from "react";

export default function Index() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen main-gradient relative overflow-x-hidden">
      {/* Background Pattern */}
      <div className="absolute top-[400px] md:top-[684px] left-0 w-full h-[400px] md:h-[757px] z-[1] opacity-30 md:opacity-100">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/c825e8e63e3c0adb94bef5f03f13e3ea4131deac?width=3842"
          alt="Line pattern background"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navbar */}
      <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 md:absolute md:top-[46px] md:left-[210px] md:transform-none w-[calc(100%-2rem)] md:w-[1500px] max-w-[1500px] h-auto md:h-[120px] z-20 px-4 md:px-0">
        <div className="flex flex-col md:flex-row items-center justify-between w-full h-auto md:h-full px-4 md:px-5 py-4 md:py-7 rounded-3xl md:rounded-full border border-white/10 bg-white/10 backdrop-blur-sm gap-4 md:gap-0">
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

          <div className="flex flex-col md:flex-row items-center justify-between w-full md:w-[1460px] h-auto md:h-[65px] gap-4 md:gap-0">
            {/* Desktop Logo and Navigation */}
            <div className="hidden md:flex items-center gap-[51px]">
              {/* Logo */}
              <div className="flex items-center gap-4 w-[375px] h-[65px]">
                <img
                  src="https://api.builder.io/api/v1/image/assets/TEMP/3249d81bd5a0516fe5c613581be785b53ef9877e?width=130"
                  alt="SentrySol Logo"
                  className="w-[50px] h-[50px]"
                />
                <span className="text-white font-poppins text-[40px] font-bold leading-none">
                  SENTRYSOL
                </span>
              </div>

              {/* Navigation Links */}
              <div className="flex items-center gap-[51px]">
                <a
                  href="#"
                  className="text-white font-poppins text-2xl font-normal leading-none px-[15px] hover:text-white/80 transition-colors"
                >
                  Products
                </a>
                <a
                  href="#"
                  className="text-white font-poppins text-2xl font-normal leading-none px-[15px] hover:text-white/80 transition-colors"
                >
                  About
                </a>
                <a
                  href="#"
                  className="text-white font-poppins text-2xl font-normal leading-none px-[15px] hover:text-white/80 transition-colors"
                >
                  Docs
                </a>
                <a
                  href="#"
                  className="text-white font-poppins text-2xl font-normal leading-none px-[15px] hover:text-white/80 transition-colors"
                >
                  Pricing
                </a>
                <button className="bg-white text-black font-poppins text-2xl font-normal leading-none px-[10px] py-[10px] rounded-[30px] w-[124px] h-[44px] flex items-center justify-center hover:bg-white/90 transition-colors">
                  Connect
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex md:hidden flex-wrap items-center justify-center gap-4 text-sm">
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
            </div>

            {/* Search Box and Connect Button */}
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative flex-1 md:w-[256px] md:flex-none h-[43px]">
                <div className="absolute inset-0 rounded-full border border-white/47 shadow-[0px_4px_0px_rgba(0,0,0,0.25)]"></div>
                <input
                  type="text"
                  placeholder="I'm looking for..."
                  className="absolute inset-0 bg-transparent text-white placeholder-white/60 px-4 rounded-full text-sm focus:outline-none"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Search className="w-[18px] h-[18px] text-white/35" />
                </div>
              </div>
              <button className="md:hidden bg-white text-black font-poppins text-sm font-normal leading-none px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
                Connect
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-auto md:h-[1257px] z-[2] pt-32 md:pt-0">
        {/* Secure. Smart. Private. */}
        <div className="absolute left-4 md:left-[176px] top-8 md:top-[140px] text-white font-poppins text-sm md:text-xl font-normal leading-none">
          Secure. Smart. Private.
        </div>

        {/* Main Heading */}
        <h1 className="relative md:absolute left-4 md:left-[176px] top-16 md:top-[182px] w-[calc(100%-2rem)] md:w-[1568px] h-auto md:h-[275px] font-poppins text-4xl sm:text-6xl md:text-8xl lg:text-[275px] font-bold leading-tight md:leading-none uppercase gradient-text text-center md:text-left px-4 md:px-0">
          SENTRYSOL
        </h1>

        {/* Logo Glow - Hidden on mobile, adjusted on tablet */}
        <div className="hidden md:block absolute left-[300px] lg:left-[580px] top-[297px] w-[400px] lg:w-[760px] h-[350px] lg:h-[663px]">
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

        {/* Mobile Logo */}
        <div className="md:hidden flex justify-center mt-8 mb-12">
          <div className="w-32 h-32 sm:w-48 sm:h-48">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/cdd82043a412ca71168235cfa284d856822ce355?width=1519"
              alt="SentrySol logo"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Description and CTA */}
        <div className="relative md:absolute left-4 md:left-[1200px] top-[350px] md:top-[531px] w-[calc(100%-2rem)] md:w-[400px] h-auto md:h-[255px] text-center md:text-left mt-8 md:mt-0">
          <p className="text-white font-poppins text-base md:text-lg font-normal leading-relaxed mb-8">
            SentrySol is an AI-native, on-device behavioral security framework
            built specifically for Web3 mobile environments, initially focusing
            on Solana Mobile Seeker.
          </p>
          <button className="bg-sentry-sage text-black font-poppins text-base md:text-lg font-normal leading-none px-6 md:px-[22px] py-3 md:py-[16px] rounded-[30px] w-full md:w-[192px] h-auto md:h-[43px] flex items-center justify-center hover:bg-sentry-sage/90 transition-colors">
            Get Started
          </button>
        </div>
      </section>

      {/* Section 02 - Intelligent Protection */}
      <section className="relative w-full h-auto md:h-[1289px] top-[200px] md:top-[1407px] z-[2] px-4 md:px-0">
        <h2 className="relative md:absolute left-0 md:left-[188px] top-[59px] w-full md:w-[1500px] h-auto md:h-[304px] text-center font-poppins text-3xl sm:text-5xl md:text-7xl lg:text-[128px] font-normal leading-tight md:leading-[175px] tracking-[2px] md:tracking-[6.4px] gradient-section-text">
          Intelligent Protection Right On Your Phone
        </h2>

        <p className="relative md:absolute left-0 md:left-[533px] top-[250px] md:top-[463px] w-full md:w-[800px] h-auto md:h-[97px] text-white text-center font-poppins text-lg md:text-2xl font-normal leading-relaxed md:leading-[40px] tracking-[1.2px] max-w-4xl mx-auto">
          We introduce an AI-native, on-device behavioral security framework
          specifically engineered to protect your Web3 mobile experience.
        </p>

        {/* Feature Cards */}
        <div className="relative md:absolute left-0 md:left-[215px] top-[350px] md:top-[710px] w-full md:w-[1490px] h-auto md:h-[519px]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-[70px] max-w-6xl mx-auto md:mx-0">
            {/* Card 1 - Your Data Private */}
            <div className="relative w-full max-w-[450px] mx-auto md:mx-0 h-[350px] md:h-[450px]">
              <div className="relative w-full h-full rounded-[23px] border-[1.5px] border-white/30 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-6 md:p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-[78px] md:h-[80px] rounded-full bg-gradient-to-b from-sentry-sage to-sentry-blue-gray flex items-center justify-center mb-6 md:mb-8">
                  <Shield className="w-8 h-8 md:w-10 md:h-10 text-black" />
                </div>
                <h3 className="text-white font-poppins text-2xl md:text-[40px] font-normal leading-tight md:leading-[30px] mb-4">
                  Your Data Private
                </h3>
                <p className="text-white font-poppins text-sm md:text-lg font-normal leading-relaxed">
                  Your behavioral data never leaves your device. Security
                  remains active, even when you're offline.
                </p>
              </div>
            </div>

            {/* Card 2 - Spots Suspicious */}
            <div className="relative w-full max-w-[450px] mx-auto md:mx-0 h-[350px] md:h-[450px] md:mt-[-69px]">
              <div className="relative w-full h-full rounded-[23px] border-[1.5px] border-white/30 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-6 md:p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-[78px] md:h-[80px] rounded-full bg-gradient-to-b from-sentry-sage to-sentry-blue-gray flex items-center justify-center mb-6 md:mb-8">
                  <Eye className="w-8 h-8 md:w-10 md:h-10 text-black" />
                </div>
                <h3 className="text-white font-poppins text-2xl md:text-[40px] font-normal leading-tight md:leading-[30px] mb-4">
                  Spots Suspicious
                </h3>
                <p className="text-white font-poppins text-sm md:text-lg font-normal leading-relaxed">
                  Guards against phishing, malicious smart contracts, and wallet
                  draining.
                </p>
              </div>
            </div>

            {/* Card 3 - Stop Threats */}
            <div className="relative w-full max-w-[450px] mx-auto md:mx-0 h-[350px] md:h-[450px]">
              <div className="relative w-full h-full rounded-[23px] border-[1.5px] border-white/30 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-6 md:p-8 flex flex-col items-center text-center">
                <div className="w-16 h-16 md:w-[78px] md:h-[80px] rounded-full bg-gradient-to-b from-sentry-sage to-sentry-blue-gray flex items-center justify-center mb-6 md:mb-8">
                  <Bug className="w-8 h-8 md:w-10 md:h-10 text-black" />
                </div>
                <h3 className="text-white font-poppins text-2xl md:text-[40px] font-normal leading-tight md:leading-[30px] mb-4">
                  Stop Threats
                </h3>
                <p className="text-white font-poppins text-sm md:text-lg font-normal leading-relaxed">
                  Instant threat detection without network delays. Our system
                  continuously adapts to new threats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 03 - Revolutionizing Web3 Mobile Security */}
      <section className="relative w-full h-auto md:h-[1503px] top-[1400px] md:top-[2846px] z-[2] px-4 md:px-0">
        <h2 className="relative md:absolute left-0 md:left-[205px] top-[75px] w-full md:w-[1500px] h-auto md:h-[264px] text-white text-center font-poppins text-3xl sm:text-5xl md:text-7xl lg:text-[128px] font-normal leading-tight md:leading-[175px]">
          Revolutionizing Web3 Mobile Security
        </h2>

        <p className="relative md:absolute left-0 md:left-[655px] top-[300px] md:top-[430px] w-full md:w-[600px] h-auto md:h-[131px] text-white text-center font-poppins text-lg md:text-2xl font-normal leading-relaxed md:leading-[40px] tracking-[1.2px] max-w-3xl mx-auto">
          SentrySol is strategically focused on the Solana Mobile ecosystem,
          providing native, enhanced dApp security directly integrated with
          devices like the Solana Seeker.
        </p>

        {/* Feature Diagram */}
        <div className="relative md:absolute left-0 md:left-[227px] top-[450px] md:top-[711px] w-full md:w-[1456px] h-auto md:h-[625px] max-w-6xl mx-auto">
          {/* Central blur circle - hidden on mobile */}
          <div className="hidden md:block absolute left-[300px] lg:left-[546px] top-[166px] w-[200px] lg:w-[295px] h-[200px] lg:h-[295px] rounded-full bg-white/8 shadow-[0px_4px_4px_66px_rgba(0,0,0,0.25)] blur-[62.65px]"></div>

          {/* Central logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 md:left-[400px] lg:left-[600px] md:transform-none top-[100px] md:top-[200px] w-[120px] md:w-[150px] lg:w-[200px] h-[120px] md:h-[150px] lg:h-[200px]">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/d0b18dc10ba3a797f474bf0852a8e6a5580a49c0?width=694"
              alt="SentrySol central logo"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Vector lines - hidden on mobile */}
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/286e70bda21015e18b1a6eb4045e76f59fe86801?width=1948"
            alt="Connection lines"
            className="hidden md:block absolute left-[100px] lg:left-[207px] top-[70px] w-[600px] lg:w-[974px] h-[300px] lg:h-[482px] object-contain opacity-50"
          />

          {/* Feature Labels - Grid layout on mobile */}
          <div className="grid grid-cols-2 md:block gap-4 mt-[250px] md:mt-0 text-center md:text-left">
            <div className="md:absolute md:left-0 md:top-[126px] bg-black/20 md:bg-black/0 rounded-[15px] px-3 py-2 md:px-[10px] md:py-[10px] text-white font-poppins text-sm md:text-[28px] font-normal leading-[30px]">
              Phishing Interceptor
            </div>
            <div className="md:absolute md:left-0 md:top-[436px] bg-black/20 md:bg-black/0 rounded-[15px] px-3 py-2 md:px-[10px] md:py-[10px] text-white font-abc-diatype text-sm md:text-[28px] font-bold leading-[30px]">
              Privacy-Preserving
            </div>
            <div className="md:absolute md:left-[200px] lg:left-[484px] md:top-0 bg-black/20 md:bg-black/0 rounded-[15px] px-3 py-2 md:px-[10px] md:py-[10px] text-white font-poppins text-sm md:text-[28px] font-normal leading-[30px]">
              Hardware-Level Security
            </div>
            <div className="md:absolute md:left-[200px] lg:left-[451px] md:top-[582px] bg-black/20 md:bg-black/0 rounded-[15px] px-3 py-2 md:px-[10px] md:py-[10px] text-white font-poppins text-sm md:text-[28px] font-normal leading-[30px]">
              Trusted Execution Environment
            </div>
            <div className="md:absolute md:left-[600px] lg:left-[1057px] md:top-[126px] bg-black/20 md:bg-black/0 rounded-[15px] px-3 py-2 md:px-[10px] md:py-[10px] text-white font-poppins text-sm md:text-[28px] font-normal leading-[30px]">
              Anomaly Detection Engine
            </div>
            <div className="md:absolute md:left-[600px] lg:left-[1093px] md:top-[436px] bg-black/20 md:bg-black/0 rounded-[15px] px-3 py-2 md:px-[10px] md:py-[10px] text-white font-poppins text-sm md:text-[28px] font-normal leading-[30px]">
              On-Device Processing
            </div>
          </div>
        </div>
      </section>

      {/* Section 04 - Vision and Mission */}
      <section className="relative w-full h-auto md:h-[1216px] top-[2400px] md:top-[4499px] z-[2] px-4 md:px-0">
        <img
          src="https://api.builder.io/api/v1/image/assets/TEMP/8013e91495f1b7f65a4ae0271db823785859a912?width=1178"
          alt="Data visualization background"
          className="hidden md:block absolute right-0 top-0 w-[300px] lg:w-[589px] h-full object-cover opacity-50"
        />

        {/* Vision */}
        <div className="relative md:absolute left-0 md:left-[196px] top-[50px] md:top-[118px] w-full md:w-[800px] h-auto md:h-[388px] mb-16 md:mb-0">
          <h2 className="text-white font-poppins text-4xl sm:text-6xl md:text-[128px] font-normal leading-tight md:leading-[124px] mb-8 md:mb-[189px] text-center md:text-left">
            Vision
          </h2>
          <p className="text-white font-poppins text-lg md:text-2xl font-normal leading-relaxed md:leading-[40px] tracking-[1.2px] text-center md:text-left">
            We envision a Web3 future where users interact with decentralized
            applications confidently and securely. SentrySol is building the
            essential, intelligent, and privacy-preserving security layer needed
            to unlock the full potential of Web3 on mobile devices.
          </p>
        </div>

        {/* Mission */}
        <div className="relative md:absolute left-0 md:left-[196px] top-[400px] md:top-[642px] w-full md:w-[600px] h-auto md:h-[452px]">
          <h2 className="text-white font-poppins text-4xl sm:text-6xl md:text-[128px] font-normal leading-tight md:leading-[124px] mb-8 md:mb-[189px] text-center md:text-left">
            Mission
          </h2>
          <p className="text-white font-poppins text-lg md:text-2xl font-normal leading-relaxed md:leading-[40px] tracking-[1.2px] text-center md:text-left">
            Empowering Users, Fostering trust and confidence in every Web3
            interaction. Securing the Ecosystem, Protecting against evolving
            threats like blind signing and wallet draining. Driving Adoption,
            Making Web3 accessible and safe for everyone.
          </p>
        </div>
      </section>

      {/* Section 05 - Seamless Integration */}
      <section className="relative w-full h-auto md:h-[1648px] top-[3200px] md:top-[5865px] z-[2] px-4 md:px-0">
        <h2 className="relative md:absolute left-0 md:left-[184px] top-[50px] md:top-[183px] w-full md:w-[1500px] h-auto md:h-[452px] text-center font-poppins text-3xl sm:text-5xl md:text-7xl lg:text-[128px] font-normal leading-tight md:leading-[175px] tracking-[2px] md:tracking-[6.4px] gradient-section-text">
          Seamless Integration for Enhanced Security.
        </h2>

        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-0 mt-16 md:mt-0">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/be7adfd84f304d55c0a85f977267b56af7b1a83a?width=1846"
            alt="Solana Seeker phone"
            className="relative md:absolute left-0 md:left-0 top-auto md:top-[400px] w-[300px] sm:w-[400px] md:w-[600px] h-auto object-contain mx-auto md:mx-0"
          />

          <div className="relative md:absolute left-0 md:left-[1124px] top-auto md:top-[785px] w-full md:w-[600px] h-auto md:h-[137px] text-center md:text-left">
            <p className="text-white font-poppins text-lg md:text-2xl font-normal leading-relaxed md:leading-[40px] tracking-[1.2px] mb-8">
              SentrySol is strategically focused on the Solana Mobile ecosystem,
              providing native, enhanced dApp security directly integrated with
              devices like the Solana Seeker.
            </p>

            <button className="bg-sentry-accent/20 text-white font-poppins text-base md:text-lg font-normal leading-none px-6 md:px-[10px] py-3 md:py-[10px] rounded-[33px] w-full md:w-[300px] h-auto md:h-[53px] flex items-center justify-center hover:bg-sentry-accent/30 transition-colors mx-auto md:mx-0">
              Read More
            </button>
          </div>
        </div>
      </section>

      {/* Section 06 - Soon On Seeker */}
      <section className="relative w-full h-auto md:h-[2010px] top-[4000px] md:top-[7663px] z-[2] px-4 md:px-0">
        {/* Animation Background */}
        <div className="absolute inset-0 w-full h-[300px] md:h-[600px] overflow-hidden opacity-30 md:opacity-100">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/3062c5637282367d8b1d3011ade4eeae1ca4cbaf?width=3840"
            alt="Wave animation 1"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/4c4f4e121a62703a20a087eb92ff9c1ad2a18eb5?width=3840"
            alt="Wave animation 2"
            className="absolute left-0 top-[-50px] md:top-[-104px] w-full h-[150px] md:h-[234px] object-cover"
          />
        </div>

        <p className="relative md:absolute left-0 md:left-[210px] top-[100px] md:top-[229px] w-full md:w-[1500px] h-auto md:h-[142px] text-white text-center font-poppins text-2xl sm:text-3xl md:text-[48px] font-normal leading-relaxed md:leading-[70px] tracking-[1px] md:tracking-[2.4px] max-w-6xl mx-auto">
          We're building the future of Web3 mobile security, a future where
          you're always protected.
        </p>

        <button className="relative md:absolute left-1/2 transform -translate-x-1/2 md:left-[810px] md:transform-none top-[250px] md:top-[421px] bg-sentry-accent/20 border-[0.5px] border-white/24 text-white font-poppins text-base md:text-lg font-normal leading-none px-6 md:px-[10px] py-3 md:py-[10px] rounded-[33px] w-[200px] md:w-[300px] h-auto md:h-[37px] flex items-center justify-center hover:bg-sentry-accent/30 transition-colors">
          Start Now
        </button>

        <h2 className="relative md:absolute left-0 md:left-[660px] top-[350px] md:top-[750px] w-full md:w-[600px] h-auto md:h-[90px] text-white font-poppins text-4xl sm:text-6xl md:text-[128px] font-normal leading-tight md:leading-[30px] tracking-[2px] md:tracking-[6.4px] text-center">
          Soon On
        </h2>

        <div className="relative md:absolute left-1/2 transform -translate-x-1/2 md:left-[400px] md:transform-none top-[450px] md:top-[900px] w-[300px] sm:w-[400px] md:w-[800px] h-auto">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/ce913d73bf4273f828f4376a9e6e3b3cb247c0e5?width=1997"
            alt="Seeker isolated"
            className="w-full h-auto object-contain"
          />
        </div>

        <div className="relative md:absolute left-1/2 transform -translate-x-1/2 md:left-[760px] md:transform-none top-[650px] md:top-[1323px] w-[300px] md:w-[400px] h-auto md:h-[159px] bg-black/0 rounded-[29px] p-[10px] flex items-center justify-center">
          <img
            src="https://api.builder.io/api/v1/image/assets/TEMP/14cd9f3ea7854a53575926aa3d38067d0d9147e1?width=760"
            alt="Solana dApp Store Badge"
            className="w-full h-full object-contain"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="relative md:absolute left-0 md:left-[200px] top-[5000px] md:top-[9722px] w-full md:w-[1520px] max-w-[calc(100%-2rem)] mx-auto md:mx-0 h-auto md:h-[445px] bg-sentry-footer z-[2] px-4 md:px-[200px] py-8 md:py-[59px]">
        <div className="relative w-full h-full">
          {/* Logo */}
          <div className="flex items-center gap-4 justify-center md:justify-start mb-8 md:mb-0">
            <img
              src="https://api.builder.io/api/v1/image/assets/TEMP/7a2765d9790496907d7a42bab916df1a729b35e2?width=78"
              alt="SentrySol Logo"
              className="w-[39px] h-[39px]"
            />
            <span className="text-white font-poppins text-lg font-bold leading-none">
              SENTRYSOL
            </span>
          </div>

          {/* Description */}
          <p className="relative md:absolute left-0 md:left-0 top-auto md:top-[65px] w-full md:w-[375px] h-auto md:h-[65px] text-white/70 font-poppins text-sm font-normal leading-relaxed text-center md:text-left mb-8 md:mb-0">
            SentrySol is an AI-native, on-device behavioral security framework
            built specifically for Web3 mobile environments, initially focusing
            on Solana Mobile Seeker.
          </p>

          {/* Navigation Grid */}
          <div className="grid grid-cols-2 md:block gap-8 md:gap-0 mb-8 md:mb-0">
            {/* Explore */}
            <div className="relative md:absolute left-0 md:left-[500px] top-auto md:top-0 text-center md:text-left">
              <h3 className="text-white font-poppins text-lg font-bold leading-[30px] mb-4">
                Explore
              </h3>
              <div className="text-white/70 font-poppins text-sm font-normal leading-[30px] space-y-2">
                <div>Press & Media</div>
                <div>Community</div>
                <div>Contact</div>
              </div>
            </div>

            {/* Resources */}
            <div className="relative md:absolute left-0 md:left-[700px] top-auto md:top-0 text-center md:text-left">
              <h3 className="text-white font-poppins text-lg font-bold leading-[30px] mb-4">
                Resources
              </h3>
              <div className="text-white/70 font-poppins text-sm font-normal leading-[30px] space-y-2">
                <div>Whitepaper</div>
                <div>Documentation</div>
                <div>Integration</div>
                <div>Blog</div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div className="relative md:absolute left-0 md:left-0 top-auto md:top-[200px] w-full md:w-[472px] mb-8 md:mb-0">
            <h3 className="text-white font-poppins text-lg font-bold leading-[30px] mb-4 text-center md:text-left">
              Join a Newsletter
            </h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter Your Email"
                className="flex-1 h-[51px] bg-white/2 rounded-[10px] px-4 text-white placeholder-white/60 border border-white/10 focus:outline-none focus:border-white/30"
              />
              <button className="bg-gradient-to-b from-white/12 to-transparent border-[1.5px] border-transparent text-white font-poppins text-base font-normal leading-[30px] px-[30px] py-[20px] rounded-[10px] w-full sm:w-[117px] h-[51px] flex items-center justify-center hover:from-white/20 transition-all">
                Submit
              </button>
            </div>
          </div>

          {/* Social Icons */}
          <div className="relative md:absolute left-1/2 transform -translate-x-1/2 md:left-[1px] md:transform-none top-auto md:top-[208px] w-[53px] h-[53px] mb-8 md:mb-0">
            <svg
              width="54"
              height="54"
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
                  <stop offset="0.545" stopColor="white" stopOpacity="0.05" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Divider and Bottom Info */}
          <div className="relative md:absolute left-0 md:left-0 top-auto md:top-[350px] w-full">
            <div className="w-full h-[2px] bg-white/15 mb-4"></div>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-white font-poppins text-base font-normal leading-[30px]">
                SentrySol, 2025
              </span>
              <span className="text-white font-poppins text-base font-normal leading-[30px]">
                LinkedIn
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
