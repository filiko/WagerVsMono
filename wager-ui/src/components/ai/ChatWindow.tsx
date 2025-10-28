"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  content: string;
  sender: "user" | "ai";
  timestamp: Date;
}

interface ChatWindowProps {
  level: number;
  onLevelUp: () => void;
}

export function ChatWindow({ level, onLevelUp }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Welcome to WagerAI! I'm here to help you make smarter predictions. What would you like to know?",
      sender: "ai",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue, level),
        sender: "ai",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);

      // Check for level up
      if (Math.random() < 0.1) {
        onLevelUp();
      }
    }, 1500);
  };

  const generateAIResponse = (userInput: string, userLevel: number): string => {
    const responses = {
      beginner: [
        "Based on current trends, I'd recommend focusing on lower-risk predictions first.",
        "For your level, I suggest starting with sports predictions as they have more predictable patterns.",
        "Remember to always consider multiple factors before making a prediction.",
      ],
      intermediate: [
        "Looking at the data, there are several key indicators pointing to a potential outcome.",
        "The historical patterns suggest a 65% probability of success in this scenario.",
        "Consider the recent performance metrics and market sentiment before deciding.",
      ],
      advanced: [
        "Advanced analysis shows complex correlations between multiple variables.",
        "The algorithmic models suggest a high-confidence prediction with 78% accuracy.",
        "Based on deep learning analysis, the optimal strategy would be to diversify your approach.",
      ],
    };

    const levelCategory = userLevel < 10 ? "beginner" : userLevel < 25 ? "intermediate" : "advanced";
    const levelResponses = responses[levelCategory];
    
    return levelResponses[Math.floor(Math.random() * levelResponses.length)];
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <Card className={`max-w-[80%] ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                <CardContent className="p-3">
                  <div className="flex items-start space-x-2">
                    {message.sender === "ai" && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm">
                          {message.sender === "user" ? "You" : "WagerAI"}
                        </span>
                        {message.sender === "ai" && (
                          <Sparkles className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    {message.sender === "user" && (
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <User className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <Card className="bg-muted">
              <CardContent className="p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask WagerAI anything..."
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
