'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { CheckCircle, FileText, Mic, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: CheckCircle,
    title: 'Visa Eligibility Check',
    description: 'Get instant answers about your visa eligibility based on your specific situation.',
  },
  {
    icon: FileText,
    title: 'Document Requirements',
    description: 'Find out exactly which documents you need for your immigration process.',
  },
  {
    icon: Mic,
    title: 'Voice & Multilingual Support',
    description: 'Ask questions by voice in your preferred language - English, French, Yoruba, Arabic, and more.',
  },
  {
    icon: Shield,
    title: 'Verified Knowledge Base',
    description: 'All answers are based on official immigration sources and verified information.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="mx-auto px-4 md:px-48 py-6 container">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="flex justify-center items-center bg-primary rounded-lg w-8 h-8">
              <span className="font-bold text-primary-foreground text-sm">TL</span>
            </div>
            <span className="font-semibold text-xl">Train LLM</span>
          </div>
          <Link href="/ask">
            <Button variant="outline">Ask a Question</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="mx-auto px-4 py-20 text-center container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 mx-auto max-w-4xl"
        >
          <h1 className="font-bold text-5xl md:text-6xl tracking-tight">
            AI-Powered Immigration Guidance
            <span className="block mt-2 text-primary">for Africans in Diaspora</span>
          </h1>
          
          <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
            Ask immigration questions by text or voice, in your language. 
            Get accurate, verified answers to help navigate your immigration journey.
          </p>
          
          <div className="flex sm:flex-row flex-col justify-center items-center gap-4">
            <Link href="/ask">
              <Button size="lg" className="px-8 py-6 text-lg">
                Ask a Question
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <p className="text-muted-foreground text-sm">
              Free to use • No registration required
            </p>
          </div>
        </motion.div>
      </section>


      {/* Footer */}
   
    </div>
  );
}