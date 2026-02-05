# Peer Reviewer Skill

**AI-powered academic rigor for your research.**

Peer Reviewer is an OpenClaw skill that simulates a multi-agent academic peer review process. It employs a "Council of Agents" to deconstruct arguments, find contradictions in established literature, and render a final judgment on the merit of a scientific paper or claim.

## 🧠 How It Works

The system uses three specialized AI agents:

1.  **The Deconstructor:** Parses raw text into a formal Logic Graph (Toulmin Model), extracting claims, premises, and evidence without judgment.
2.  **The Devil's Advocate:** Takes the claims and actively searches for contradictions (using Google Serper & ArXiv). It looks for theoretical conflicts, empirical contradictions, and prior art.
3.  **The Judge:** Evaluates the Logic Graph against the Devil's Advocate's objections. It scores the paper on logical coherence, foundational integrity, and empirical falsifiability, ignoring "consensus" in favor of strict logical validity.

## 🚀 Installation

```bash
npm install @sschepis/peer-reviewer
```

*Note: This package is designed to be used as an OpenClaw skill but can also run standalone.*

## 🛠️ Usage

### As an OpenClaw Skill

Trigger the skill by asking OpenClaw:
> "Review this paper for flaws."
> "Analyze the logic of this argument."

(Ensure the skill is loaded in your OpenClaw configuration).

### Standalone CLI

You can run the reviewer directly on a text file or a raw string:

```bash
# Review a file
node dist/index.js "/path/to/paper.txt"

# Review a raw claim
node dist/index.js "Claim: We can exceed the speed of light by..."
```

## ⚙️ Configuration

The reviewer requires access to LLM and Search providers. Create a `.env` file or set environment variables:

```env
# Google Vertex AI (Gemini)
GOOGLE_APPLICATION_CREDENTIALS="path/to/google.json"
VERTEX_AI_MODEL="gemini-3-pro-preview"
VERTEX_AI_LOCATION="us-central1"

# Search Provider (Google Serper)
SERPER_API_KEY="your_serper_key"
```

## 📊 Output: The Merit Report

The tool generates a JSON report containing:

*   **Overall Score (0-10):** A weighted metric of logical and empirical strength.
*   **Defense Strategy:** How the author might address the strongest objections.
*   **Suggestions:** Concrete steps to improve the paper's rigor.
*   **Dimensions:** Detailed scores for Logical Coherence, Causal Robustness, etc.

## License

MIT
