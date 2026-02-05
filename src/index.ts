import { ReviewEngine } from './engine';
import { DeconstructionAgent, DevilsAdvocateAgent, JudgeAgent } from './agents';
import { VertexAIAdapter } from './adapters/vertex_ai';
import { SerperSearchAdapter } from './adapters/serper_search';
import { ArxivAdapter } from './adapters/arxiv';
import { FileStorageAdapter } from './adapters/file_storage';
import { MeritReport } from './types';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export interface PeerReviewerConfig {
  googleCredentialsPath?: string;
  vertexAIModel?: string;
  vertexAILocation?: string;
  serperApiKey?: string;
  dataDir?: string;
}

export class PeerReviewer {
  private engine: ReviewEngine;
  private storage: FileStorageAdapter;

  constructor(config: PeerReviewerConfig = {}) {
    const googleCredentialsPath = config.googleCredentialsPath || process.env.GOOGLE_CREDENTIALS_PATH || './google.json';
    const vertexAIModel = config.vertexAIModel || process.env.VERTEX_AI_MODEL || 'gemini-3-pro-preview';
    const vertexAILocation = config.vertexAILocation || process.env.VERTEX_AI_LOCATION || 'us-central1';
    const serperApiKey = config.serperApiKey || process.env.SERPER_API_KEY || '7edbc239394bb9b75ce5543fb6987ba4256b3269';
    const dataDir = config.dataDir || './data';

    // Initialize Adapters
    const llm = new VertexAIAdapter(googleCredentialsPath, vertexAIModel, vertexAILocation);
    const serperSearch = new SerperSearchAdapter(serperApiKey);
    const arxivSearch = new ArxivAdapter();
    this.storage = new FileStorageAdapter(dataDir);

    // Composite Search Provider
    const searchProvider = {
      findContradictions: async (claim: string) => {
        const serperResults = await serperSearch.findContradictions(claim);
        const arxivResults = await arxivSearch.findContradictions(claim);
        return [...serperResults, ...arxivResults];
      }
    };

    this.engine = new ReviewEngine(
      new DeconstructionAgent(llm),
      new DevilsAdvocateAgent(llm, searchProvider),
      new JudgeAgent(llm)
    );
  }

  async review(paperText: string): Promise<MeritReport> {
    return this.engine.processPaper(paperText);
  }

  async saveReport(report: MeritReport, id?: string): Promise<string> {
    const reportId = id || `report-${Date.now()}`;
    await this.storage.save('reports', reportId, report);
    return reportId;
  }
}

// Standalone execution support
if (require.main === module) {
  (async () => {
    const paperText = `
    Title: Entropic Convergence in Over-Parameterized Neural Networks
    ... (truncated for brevity, pass full text in CLI args or file) ...
    `;
    
    // Check for file arg
    const args = process.argv.slice(2);
    let textToReview = paperText;
    
    if (args.length > 0) {
        const fs = require('fs');
        try {
            if (fs.existsSync(args[0])) {
                textToReview = fs.readFileSync(args[0], 'utf-8');
            } else {
                textToReview = args[0];
            }
        } catch (e) {
            console.error("Error reading input:", e);
            process.exit(1);
        }
    }

    console.log("Initializing Peer Reviewer...");
    const reviewer = new PeerReviewer();
    
    try {
        console.log("Reviewing paper...");
        const report = await reviewer.review(textToReview);
        console.log("\n=== Merit Report ===");
        console.log(JSON.stringify(report, null, 2));
        
        const id = await reviewer.saveReport(report);
        console.log(`\nReport saved with ID: ${id}`);
    } catch (error) {
        console.error("Review failed:", error);
    }
  })();
}
