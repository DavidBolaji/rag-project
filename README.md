# Train LLM - AI-Powered Immigration Assistant

## Overview

Train LLM is an advanced AI-powered immigration guidance assistant designed specifically for Africans in the diaspora. Leveraging state-of-the-art Retrieval-Augmented Generation (RAG) techniques, the system provides accurate, context-aware answers to immigration-related questions via text or voice input, supporting multiple languages including English and French.

This project demonstrates deep expertise in combining large language models with external knowledge bases to deliver precise, verified, and actionable immigration guidance. It integrates speech-to-text, translation services, intent detection, and a robust RAG pipeline to enhance user experience and answer quality.

---

## Key Features

- **Multilingual Support & Voice Input**: Users can ask questions by typing or speaking in supported languages. Audio input is transcribed and translated as needed.
- **Retrieval-Augmented Generation (RAG)**: Combines vector-based document retrieval with large language model generation to provide contextually relevant and factually accurate answers.
- **Intent Detection**: Classifies user queries into intents (e.g., visa eligibility, document requirements) to enable tailored workflows and responses.
- **Verified Knowledge Base**: Answers are grounded in official immigration documents and FAQs, ensuring reliability.
- **Conversation History**: Maintains a session history of questions and answers for user reference.
- **Feedback & Evaluation**: Automated evaluation of AI responses with feedback capture to continuously improve answer quality.

---

## Architecture & Data Flow

### 1. User Interaction

- **Frontend Components**:
  - `ChatInput`: Accepts user questions via text or voice, manages language selection, and handles audio recording and submission.
  - `AnswerCard`: Displays AI-generated answers with intent badges and source citations.
  - `ConversationHistory`: Shows past interactions with options to clear history.

### 2. API Layer

- **Question API (`/api/question`)**:
  - Receives user questions and conversation history.
  - Translates non-English input to English.
  - Routes the query through the RAG pipeline.
  - Translates the AI response back to the user's language.
  - Evaluates and stores feedback on the response quality.

- **Audio API (`/api/audio`)**:
  - Accepts audio uploads.
  - Saves audio temporarily, performs speech-to-text transcription.
  - Translates transcription to English if needed.
  - Routes text through the RAG pipeline.
  - Translates and returns the final answer.
  - Evaluates and stores feedback.

### 3. Retrieval-Augmented Generation (RAG) Pipeline

- **Document Loading & Chunking**:
  - Loads immigration-related documents from the knowledge base.
  - Splits documents into manageable chunks for embedding.

- **Vector Store Creation**:
  - Uses OpenAI embeddings to convert chunks into vector representations.
  - Stores vectors in Pinecone, a scalable vector database.

- **Context Retrieval**:
  - Performs similarity search in Pinecone to find top relevant chunks for the query.

- **Prompt Building**:
  - Constructs a prompt combining the user query, retrieved context, conversation history, and language preferences.

- **Answer Generation**:
  - Calls OpenAI's GPT-3.5-turbo model with the prompt.
  - Produces a concise, factual answer grounded in retrieved context.

### 4. Intent Detection & Workflow Routing

- Detects user intent (e.g., visa eligibility).
- Routes queries to specialized workflows or the general RAG pipeline.
- Enables future extensibility for intent-specific handling.

### 5. Feedback & Evaluation

- Evaluates AI responses for accuracy, relevance, and completeness.
- Captures feedback data for continuous improvement.

---

## Retrieval-Augmented Generation (RAG) Implementation Details

- **Vector Embeddings**: Uses OpenAI's `text-embedding-3-small` model to embed document chunks.
- **Vector Database**: Pinecone stores and indexes embeddings for efficient similarity search.
- **Context Retrieval**: Retrieves top 4 relevant document chunks per query.
- **Prompt Engineering**: Combines retrieved context with user query and conversation turns to form a comprehensive prompt.
- **LLM Answering**: GPT-3.5-turbo generates answers with low temperature (0.2) to ensure factual and concise responses.
- **Multilingual Handling**: Translates user input to English for retrieval and generation, then translates answers back to the user's language.

---

## Project Structure

- **`app/api`**: API routes handling question and audio input, integrating translation, speech-to-text, RAG pipeline, and feedback evaluation.
- **`components/`**: React UI components for chat input, answer display, conversation history, and voice recording.
- **`data/documents/`**: Immigration knowledge base documents used for retrieval.
- **`lib/rag/`**: Core RAG pipeline modules including document loading, chunking, vector store management, context retrieval, prompt building, and answer generation.
- **`lib/workflows/`**: Workflow router and intent detection logic to direct queries appropriately.
- **`lib/services/`**: External service integrations for speech-to-text and translation.
- **`lib/eval/`**: Response evaluation and feedback capture modules.

---

## Getting Started

1. **Setup Environment Variables**:
   - `OPENAI_API_KEY`: OpenAI API key.
   - `PINECONE_API_KEY`: Pinecone API key.
   - `PINECONE_INDEX`: Pinecone index name.

2. **Install Dependencies**:
   ```bash
   pnpm install
   ```

3. **Run Development Server**:
   ```bash
   pnpm run dev
   ```

4. **Access Application**:
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Conclusion

Train LLM exemplifies a sophisticated application of Retrieval-Augmented Generation to deliver trustworthy, multilingual immigration assistance. By combining vector search over verified documents with powerful language models and seamless voice/text input, it empowers users with precise, context-aware answers tailored to their needs.

This project showcases expertise in modern AI integration, scalable vector search, multilingual NLP workflows, and user-centric interface design — all critical for building impactful AI assistants in specialized domains.
