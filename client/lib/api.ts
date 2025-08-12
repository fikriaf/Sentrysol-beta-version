import { supabase } from './supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export interface AnalysisData {
  progress: number;
  step: number;
  status: string;
  analysis_result?: any;
  detailed_data?: any;
}

export class BackendAPI {
  static async analyzeWallet(walletAddress: string): Promise<EventSource> {
    const eventSource = new EventSource(`${BACKEND_URL}/analyze/${walletAddress}`);
    return eventSource;
  }

  static async saveAnalysisResult(walletAddress: string, analysisData: AnalysisData) {
    try {
      const { data, error } = await supabase
        .from('wallet_analyses')
        .insert([
          {
            wallet_address: walletAddress,
            analysis_data: analysisData,
            created_at: new Date().toISOString(),
          }
        ]);

      if (error) {
        console.error('Error saving analysis:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      return null;
    }
  }

  static async getWalletHistory(walletAddress: string) {
    try {
      const { data, error } = await supabase
        .from('wallet_analyses')
        .select('*')
        .eq('wallet_address', walletAddress)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching from Supabase:', error);
      return [];
    }
  }

  static async checkBackendHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${BACKEND_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('Backend health check failed:', error);
      return false;
    }
  }
}
