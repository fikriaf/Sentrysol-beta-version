# SentrySol Integration Setup

## Features Implemented

### 1. Solana Wallet Integration
- **Wallet Adapter**: Integrated with `@solana/wallet-adapter-react`
- **Supported Wallets**: Phantom, Solflare, Torus
- **Auto-connect**: Automatically connects to previously connected wallets
- **Network**: Configured for Solana Mainnet

### 2. Navigation Flow
- **Connect Wallet**: Both "Connect" buttons in navbar now open wallet selection modal
- **Get Started**: 
  - If wallet not connected → Opens wallet selection modal
  - If wallet connected → Redirects to `/dashboard`
- **Start Now**: Same behavior as Get Started button

### 3. Dashboard Page
- **Authentication**: Requires connected wallet to access
- **Wallet Display**: Shows connected wallet address
- **Analysis Integration**: Ready to connect to SentrySol backend
- **Real-time Updates**: Uses EventSource for streaming analysis results

### 4. Backend Integration
- **API Service**: `client/lib/api.ts` handles backend communication
- **Environment Variables**: Backend URL configurable via `VITE_BACKEND_URL`
- **Health Checks**: Built-in backend connectivity validation

### 5. Supabase Integration
- **Configuration**: Ready to connect with provided Supabase instance
- **Data Storage**: Analysis results can be saved to Supabase
- **History**: Wallet analysis history retrieval

## Environment Variables

Set these using the DevServerControl tool:

```bash
VITE_SUPABASE_KEY=your_supabase_anon_key_here
VITE_BACKEND_URL=http://localhost:8000
```

## Backend Repository

The integration expects the SentrySol backend from:
https://github.com/sentrysol666-sys/SentrySol-Demo.git

### Expected Endpoints:
- `GET /health` - Health check
- `GET /analyze/{wallet_address}` - EventSource endpoint for streaming analysis

## Usage Flow

1. **User visits homepage**
2. **Clicks "Connect" or "Get Started"**
   - If wallet not connected: Opens wallet selection modal
3. **User selects and connects wallet** (Phantom, Solflare, etc.)
4. **User clicks "Get Started" again**
   - Now redirects to `/dashboard`
5. **Dashboard shows wallet info and analysis tools**
6. **User can start security analysis**
   - Connects to backend via EventSource
   - Real-time progress updates
   - Results displayed in dashboard

## Components Added

- `WalletProvider.tsx` - Wallet adapter context provider
- `Dashboard.tsx` - Main dashboard page with analysis
- `lib/supabase.ts` - Supabase client configuration
- `lib/api.ts` - Backend API service
- `lib/walletUtils.ts` - Wallet connection utilities

## Styling

- Wallet buttons styled to match SentrySol design
- Dashboard uses same gradient background and design system
- Responsive design for mobile and desktop
- Consistent with existing brand colors and typography

## Next Steps

1. **Set up actual Supabase key** in environment variables
2. **Clone and run the SentrySol backend** from the provided repository
3. **Test wallet connections** with real wallets
4. **Customize analysis results display** based on actual backend response format
5. **Add additional security features** as needed
