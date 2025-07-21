import { Search, X } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen main-gradient relative overflow-x-hidden">
      {/* Background Pattern */}
      <div className="absolute top-[684px] left-0 w-full h-[757px] z-[1]">
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/c825e8e63e3c0adb94bef5f03f13e3ea4131deac?width=3842" 
          alt="Line pattern background" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Navbar */}
      <nav className="absolute top-[46px] left-[210px] w-[1500px] h-[120px] z-10">
        <div className="flex items-center justify-center w-full h-full px-5 py-7 rounded-full border border-white/10 bg-white/10 backdrop-blur-sm">
          <div className="flex items-center justify-between w-[1460px] h-[65px]">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-[51px]">
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
                <a href="#" className="text-white font-poppins text-2xl font-normal leading-none px-[15px] hover:text-white/80 transition-colors">
                  Products
                </a>
                <a href="#" className="text-white font-poppins text-2xl font-normal leading-none px-[15px] hover:text-white/80 transition-colors">
                  About
                </a>
                <a href="#" className="text-white font-poppins text-2xl font-normal leading-none px-[15px] hover:text-white/80 transition-colors">
                  Docs
                </a>
                <a href="#" className="text-white font-poppins text-2xl font-normal leading-none px-[15px] hover:text-white/80 transition-colors">
                  Pricing
                </a>
                <button className="bg-white text-black font-poppins text-2xl font-normal leading-none px-[10px] py-[10px] rounded-[30px] w-[124px] h-[44px] flex items-center justify-center hover:bg-white/90 transition-colors">
                  Connect
                </button>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative w-[256px] h-[43px]">
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
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-[1257px] z-[2]">
        {/* Secure. Smart. Private. */}
        <div className="absolute left-[176px] top-[140px] text-white font-poppins text-xl font-normal leading-none">
          Secure. Smart. Private.
        </div>

        {/* Main Heading */}
        <h1 className="absolute left-[176px] top-[182px] w-[1568px] h-[275px] font-poppins text-[275px] font-bold leading-none uppercase gradient-text">
          SENTRYSOL
        </h1>

        {/* Logo Glow */}
        <div className="absolute left-[580px] top-[297px] w-[760px] h-[663px]">
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

        {/* Description and CTA */}
        <div className="absolute left-[1467px] top-[531px] w-[300px] h-[255px]">
          <p className="text-white font-poppins text-lg font-normal leading-relaxed mb-8">
            SentrySol is an AI-native, on-device behavioral security framework
            built specifically for Web3 mobile environments, initially
            focusing on Solana Mobile Seeker.
          </p>
          <button className="bg-sentry-sage text-black font-poppins text-lg font-normal leading-none px-[22px] py-[16px] rounded-[30px] w-[192px] h-[43px] flex items-center justify-center hover:bg-sentry-sage/90 transition-colors">
            Get Started
          </button>
        </div>
      </section>

      {/* Section 02 - Intelligent Protection */}
      <section className="relative w-full h-[1289px] top-[1407px] z-[2]">
        <h2 className="absolute left-[188px] top-[59px] w-[1500px] h-[304px] text-center font-poppins text-[128px] font-normal leading-[175px] tracking-[6.4px] gradient-section-text">
          Intelligent Protection Right On Your Phone
        </h2>
        
        <p className="absolute left-[533px] top-[463px] w-[800px] h-[97px] text-white text-center font-poppins text-2xl font-normal leading-[40px] tracking-[1.2px]">
          We introduce an AI-native, on-device behavioral security framework
          specifically engineered to protect your Web3 mobile experience.
        </p>

        {/* Feature Cards */}
        <div className="absolute left-[215px] top-[710px] w-[1490px] h-[519px]">
          {/* Card 1 - Your Data Private */}
          <div className="absolute left-0 top-[69px] w-[450px] h-[450px]">
            <div className="relative w-full h-full rounded-[23px] border-[1.5px] border-white/30 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-8">
              <div className="absolute left-[186px] top-[42px] w-[78px] h-[80px]">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-sentry-sage to-sentry-blue-gray flex items-center justify-center">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24 6L12 12V22C12 30 18 37.5 24 40C30 37.5 36 30 36 22V12L24 6ZM24 14C26.2 14 28 15.8 28 18C28 20.2 26.2 22 24 22C21.8 22 20 20.2 20 18C20 15.8 21.8 14 24 14ZM24 32C20.7 32 17.8 30.3 16 27.7C16.2 25 22 23.8 24 23.8C26 23.8 31.8 25 32 27.7C30.2 30.3 27.3 32 24 32Z" fill="#1C1B1F"/>
                  </svg>
                </div>
              </div>
              <h3 className="absolute left-[25px] top-[192px] w-[400px] h-[48px] text-white text-center font-poppins text-[40px] font-normal leading-[30px]">
                Your Data Private
              </h3>
            </div>
          </div>

          {/* Card 2 - Spots Suspicious */}
          <div className="absolute left-[520px] top-0 w-[450px] h-[450px]">
            <div className="relative w-full h-full rounded-[23px] border-[1.5px] border-white/30 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-8">
              <div className="absolute left-[186px] top-[42px] w-[78px] h-[80px]">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-sentry-sage to-sentry-blue-gray flex items-center justify-center">
                  <Search className="w-8 h-8 text-black" />
                </div>
              </div>
              <h3 className="absolute left-[25px] top-[192px] w-[400px] h-[48px] text-white text-center font-poppins text-[40px] font-normal leading-[30px]">
                Spots Suspicious
              </h3>
              <p className="absolute left-[25px] top-[260px] w-[400px] text-white text-center font-poppins text-lg font-normal leading-relaxed">
                Guards against phishing, malicious smart contracts, and wallet draining.
              </p>
            </div>
          </div>

          {/* Card 3 - Stop Threats */}
          <div className="absolute left-[1040px] top-[69px] w-[450px] h-[450px]">
            <div className="relative w-full h-full rounded-[23px] border-[1.5px] border-white/30 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm p-8">
              <div className="absolute left-[186px] top-[42px] w-[78px] h-[80px]">
                <div className="w-full h-full rounded-full bg-gradient-to-b from-sentry-sage to-sentry-blue-gray flex items-center justify-center">
                  <X className="w-8 h-8 text-black" />
                </div>
              </div>
              <h3 className="absolute left-[25px] top-[192px] w-[400px] h-[48px] text-white text-center font-poppins text-[40px] font-normal leading-[30px]">
                Stop Threats
              </h3>
              <p className="absolute left-[25px] top-[260px] w-[400px] text-white text-center font-poppins text-lg font-normal leading-relaxed">
                Instant threat detection without network delays. Our system continuously adapts to new threats.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom description for Card 1 */}
        <p className="absolute left-[533px] top-[1173px] w-[800px] h-[97px] text-white text-center font-poppins text-2xl font-normal leading-[40px] tracking-[1.2px]">
          Your behavioral data never leaves your device. Security remains
          active, even when you're offline.
        </p>
      </section>

      {/* Section 03 - Revolutionizing Web3 Mobile Security */}
      <section className="relative w-full h-[1503px] top-[2846px] z-[2]">
        <h2 className="absolute left-[205px] top-[75px] w-[1500px] h-[264px] text-white text-center font-poppins text-[128px] font-normal leading-[175px]">
          Revolutionizing Web3 Mobile Security
        </h2>
        
        <p className="absolute left-[655px] top-[430px] w-[600px] h-[131px] text-white text-center font-poppins text-2xl font-normal leading-[40px] tracking-[1.2px]">
          SentrySol is strategically focused on the Solana Mobile ecosystem,
          providing native, enhanced dApp security directly integrated with
          devices like the Solana Seeker.
        </p>

        {/* Feature Diagram */}
        <div className="absolute left-[227px] top-[711px] w-[1456px] h-[625px]">
          {/* Central blur circle */}
          <div className="absolute left-[546px] top-[166px] w-[295px] h-[295px] rounded-full bg-white/8 shadow-[0px_4px_4px_66px_rgba(0,0,0,0.25)] blur-[62.65px]"></div>
          
          {/* Central logo */}
          <div className="absolute left-[600px] top-[200px] w-[200px] h-[200px]">
            <img 
              src="https://api.builder.io/api/v1/image/assets/TEMP/d0b18dc10ba3a797f474bf0852a8e6a5580a49c0?width=694" 
              alt="SentrySol central logo" 
              className="w-full h-full object-contain"
            />
          </div>

          {/* Vector lines */}
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/286e70bda21015e18b1a6eb4045e76f59fe86801?width=1948" 
            alt="Connection lines" 
            className="absolute left-[207px] top-[70px] w-[974px] h-[482px] object-contain"
          />

          {/* Feature Labels */}
          <div className="absolute left-0 top-[126px] bg-black/0 rounded-[15px] px-[10px] py-[10px] text-white font-poppins text-[28px] font-normal leading-[30px]">
            Phishing Interceptor
          </div>
          <div className="absolute left-0 top-[436px] bg-black/0 rounded-[15px] px-[10px] py-[10px] text-white font-abc-diatype text-[28px] font-bold leading-[30px]">
            Privacy-Preserving
          </div>
          <div className="absolute left-[484px] top-0 bg-black/0 rounded-[15px] px-[10px] py-[10px] text-white font-poppins text-[28px] font-normal leading-[30px]">
            Hardware-Level Security
          </div>
          <div className="absolute left-[451px] top-[582px] bg-black/0 rounded-[15px] px-[10px] py-[10px] text-white font-poppins text-[28px] font-normal leading-[30px]">
            Trusted Execution Environment
          </div>
          <div className="absolute left-[1057px] top-[126px] bg-black/0 rounded-[15px] px-[10px] py-[10px] text-white font-poppins text-[28px] font-normal leading-[30px]">
            Anomaly Detection Engine
          </div>
          <div className="absolute left-[1093px] top-[436px] bg-black/0 rounded-[15px] px-[10px] py-[10px] text-white font-poppins text-[28px] font-normal leading-[30px]">
            On-Device Processing
          </div>
        </div>
      </section>

      {/* Section 04 - Vision and Mission */}
      <section className="relative w-full h-[1216px] top-[4499px] z-[2]">
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/8013e91495f1b7f65a4ae0271db823785859a912?width=1178" 
          alt="Data visualization background" 
          className="absolute right-0 top-0 w-[589px] h-full object-cover"
        />
        
        {/* Vision */}
        <div className="absolute left-[196px] top-[118px] w-[800px] h-[388px]">
          <h2 className="text-white font-poppins text-[128px] font-normal leading-[124px] mb-[189px]">
            Vision
          </h2>
          <p className="text-white font-poppins text-2xl font-normal leading-[40px] tracking-[1.2px]">
            We envision a Web3 future where users interact with decentralized
            applications confidently and securely. SentrySol is building the
            essential, intelligent, and privacy-preserving security layer
            needed to unlock the full potential of Web3 on mobile devices.
          </p>
        </div>

        {/* Mission */}
        <div className="absolute left-[196px] top-[642px] w-[600px] h-[452px]">
          <h2 className="text-white font-poppins text-[128px] font-normal leading-[124px] mb-[189px]">
            Mission
          </h2>
          <p className="text-white font-poppins text-2xl font-normal leading-[40px] tracking-[1.2px]">
            Empowering Users, Fostering trust and confidence in every Web3
            interaction. Securing the Ecosystem, Protecting against evolving
            threats like blind signing and wallet draining. Driving Adoption,
            Making Web3 accessible and safe for everyone.
          </p>
        </div>
      </section>

      {/* Section 05 - Seamless Integration */}
      <section className="relative w-full h-[1648px] top-[5865px] z-[2]">
        <h2 className="absolute left-[184px] top-[183px] w-[1500px] h-[452px] text-center font-poppins text-[128px] font-normal leading-[175px] tracking-[6.4px] gradient-section-text">
          Seamless Integration for Enhanced Security.
        </h2>
        
        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/be7adfd84f304d55c0a85f977267b56af7b1a83a?width=1846" 
          alt="Solana Seeker phone" 
          className="absolute left-0 top-[400px] w-[600px] h-auto object-contain"
        />
        
        <p className="absolute left-[1124px] top-[785px] w-[600px] h-[137px] text-white font-poppins text-2xl font-normal leading-[40px] tracking-[1.2px]">
          SentrySol is strategically focused on the Solana Mobile ecosystem,
          providing native, enhanced dApp security directly integrated with
          devices like the Solana Seeker.
        </p>
        
        <button className="absolute left-[1124px] top-[1072px] bg-sentry-accent/20 text-white font-poppins text-lg font-normal leading-none px-[10px] py-[10px] rounded-[33px] w-[300px] h-[53px] flex items-center justify-center hover:bg-sentry-accent/30 transition-colors">
          Read More
        </button>
      </section>

      {/* Section 06 - Soon On Seeker */}
      <section className="relative w-full h-[2010px] top-[7663px] z-[2]">
        {/* Animation Background */}
        <div className="absolute inset-0 w-full h-[600px] overflow-hidden">
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/3062c5637282367d8b1d3011ade4eeae1ca4cbaf?width=3840" 
            alt="Wave animation 1" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/4c4f4e121a62703a20a087eb92ff9c1ad2a18eb5?width=3840" 
            alt="Wave animation 2" 
            className="absolute left-0 top-[-104px] w-full h-[234px] object-cover"
          />
        </div>

        <p className="absolute left-[210px] top-[229px] w-[1500px] h-[142px] text-white text-center font-poppins text-[48px] font-normal leading-[70px] tracking-[2.4px]">
          We're building the future of Web3 mobile security, a future where
          you're always protected.
        </p>

        <button className="absolute left-[810px] top-[421px] bg-sentry-accent/20 border-[0.5px] border-white/24 text-white font-poppins text-lg font-normal leading-none px-[10px] py-[10px] rounded-[33px] w-[300px] h-[37px] flex items-center justify-center hover:bg-sentry-accent/30 transition-colors">
          Start Now
        </button>

        <h2 className="absolute left-[660px] top-[750px] w-[600px] h-[90px] text-white font-poppins text-[128px] font-normal leading-[30px] tracking-[6.4px]">
          Soon On
        </h2>

        <img 
          src="https://api.builder.io/api/v1/image/assets/TEMP/ce913d73bf4273f828f4376a9e6e3b3cb247c0e5?width=1997" 
          alt="Seeker isolated" 
          className="absolute left-[400px] top-[900px] w-[800px] h-auto object-contain"
        />

        <div className="absolute left-[760px] top-[1323px] w-[400px] h-[159px] bg-black/0 rounded-[29px] p-[10px] flex items-center justify-center">
          <img 
            src="https://api.builder.io/api/v1/image/assets/TEMP/14cd9f3ea7854a53575926aa3d38067d0d9147e1?width=760" 
            alt="Solana dApp Store Badge" 
            className="w-full h-full object-contain"
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="absolute left-[200px] top-[9722px] w-[1520px] h-[445px] bg-sentry-footer z-[2] px-[200px] py-[59px]">
        <div className="relative w-full h-full">
          {/* Logo */}
          <div className="absolute left-0 top-0 flex items-center gap-4">
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
          <p className="absolute left-0 top-[65px] w-[375px] h-[65px] text-white/70 font-poppins text-sm font-normal leading-relaxed">
            SentrySol is an AI-native, on-device behavioral security
            framework built specifically for Web3 mobile environments,
            initially focusing on Solana Mobile Seeker.
          </p>

          {/* Explore */}
          <div className="absolute left-[500px] top-0">
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
          <div className="absolute left-[700px] top-0">
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

          {/* Newsletter */}
          <div className="absolute left-0 top-[200px] w-[472px]">
            <h3 className="text-white font-poppins text-lg font-bold leading-[30px] mb-4">
              Join a Newsletter
            </h3>
            <div className="flex gap-4">
              <input 
                type="email" 
                placeholder="Enter Your Email"
                className="flex-1 h-[51px] bg-white/2 rounded-[10px] px-4 text-white placeholder-white/60 border border-white/10 focus:outline-none focus:border-white/30"
              />
              <button className="bg-gradient-to-b from-white/12 to-transparent border-[1.5px] border-transparent text-white font-poppins text-base font-normal leading-[30px] px-[30px] py-[20px] rounded-[10px] w-[117px] h-[51px] flex items-center justify-center hover:from-white/20 transition-all">
                Submit
              </button>
            </div>
          </div>

          {/* Social Icons */}
          <div className="absolute left-[1px] top-[208px] w-[53px] h-[53px]">
            <svg width="54" height="54" viewBox="0 0 54 54" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="26.6667" cy="26.6667" r="25.9167" fill="url(#paint0_linear)" stroke="url(#paint1_linear)" strokeWidth="1.5"/>
              <path d="M38.2615 19.0621C37.3381 19.4627 36.3617 19.7275 35.3624 19.8483C36.4166 19.2185 37.2066 18.2278 37.5859 17.0598C36.5952 17.6496 35.5108 18.065 34.3797 18.2882C33.6237 17.4684 32.6169 16.9226 31.5173 16.7366C30.4177 16.5506 29.2874 16.7348 28.3038 17.2603C27.3201 17.7859 26.5387 18.623 26.0821 19.6405C25.6255 20.658 25.5196 21.7983 25.7809 22.8825C23.7779 22.7812 21.8186 22.2596 20.0303 21.3517C18.242 20.4438 16.6647 19.1699 15.4008 17.6126C14.9576 18.3867 14.7246 19.2634 14.7252 20.1554C14.7236 20.9838 14.9269 21.7998 15.317 22.5306C15.7071 23.2615 16.2718 23.8845 16.9609 24.3443C16.16 24.3225 15.3761 24.1076 14.6761 23.7178V23.7792C14.6821 24.9399 15.0888 26.0629 15.8275 26.9583C16.5662 27.8537 17.5914 28.4664 18.7298 28.6929C18.2916 28.8262 17.8366 28.8965 17.3786 28.9017C17.0615 28.898 16.7452 28.8692 16.4327 28.8157C16.7569 29.8142 17.3843 30.6867 18.2275 31.312C19.0707 31.9373 20.0879 32.2842 21.1375 32.3044C19.3652 33.6989 17.177 34.46 14.9218 34.4664C14.5112 34.4677 14.1009 34.4431 13.6934 34.3927C15.9959 35.8793 18.6792 36.6686 21.42 36.6652C23.3114 36.6849 25.1877 36.3274 26.9394 35.6138C28.6911 34.9002 30.283 33.8446 31.6222 32.5089C32.9614 31.1731 34.021 29.5839 34.7391 27.8341C35.4572 26.0842 35.8195 24.2088 35.8047 22.3174C35.8047 22.1086 35.8047 21.8875 35.8047 21.6664C36.7686 20.9475 37.6 20.0663 38.2615 19.0621Z" fill="white"/>
              <defs>
                <linearGradient id="paint0_linear" x1="26.6667" y1="0" x2="26.6667" y2="53.3333" gradientUnits="userSpaceOnUse">
                  <stop stopColor="white" stopOpacity="0.05"/>
                  <stop offset="1" stopColor="white" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="paint1_linear" x1="26.6667" y1="-1.41844" x2="55.3192" y2="24.4537" gradientUnits="userSpaceOnUse">
                  <stop stopColor="white" stopOpacity="0.3"/>
                  <stop offset="0.545" stopColor="white" stopOpacity="0.05"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Divider and Bottom Info */}
          <div className="absolute left-0 top-[350px] w-full">
            <div className="w-full h-[2px] bg-white/15 mb-4"></div>
            <div className="flex items-center justify-between">
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
