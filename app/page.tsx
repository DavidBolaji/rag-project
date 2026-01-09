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
      <header className="container mx-auto px-4 md:px-48 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TL</span>
            </div>
            <span className="font-semibold text-xl">Train LLM</span>
          </div>
          <Link href="/ask">
            <Button variant="outline">Ask a Question</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            AI-Powered Immigration Guidance
            <span className="block text-primary mt-2">for Africans in Diaspora</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ask immigration questions by text or voice, in your language. 
            Get accurate, verified answers to help navigate your immigration journey.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/ask">
              <Button size="lg" className="text-lg px-8 py-6">
                Ask a Question
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              Free to use • No registration required
            </p>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for immigration guidance
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI assistant provides comprehensive support for your immigration questions
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 * index }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center"
        >
          <Card className="max-w-2xl mx-auto bg-primary text-primary-foreground">
            <CardContent className="p-12">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Ready to get started?
              </h3>
              <p className="text-primary-foreground/90 mb-8">
                Join thousands of Africans in diaspora who trust Train LLM for their immigration guidance.
              </p>
              <Link href="/ask">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Ask Your First Question
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t">
        <div className="text-center text-muted-foreground">
          <p>&copy; {String((new Date()).getFullYear())} Train LLM. Built with care for the African diaspora community.</p>
        </div>
      </footer>
    </div>
  );
}