'use client' // Required for React hooks in Next.js

import { useState, useRef, useEffect } from 'react'
import { Message } from '@/types/chat'
import { useDarkMode } from '@/hooks/useDarkMode'

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { isDark, toggleDarkMode } = useDarkMode()

  const handleGenerateVideo = async (messageIndex: number) => {
    const message = messages[messageIndex]
    if (!message || message.role !== 'assistant' || message.videoGenerating) {
      return
    }

    // Mark message as generating video
    const updatedMessages = [...messages]
    updatedMessages[messageIndex] = {
      ...message,
      videoGenerating: true
    }
    setMessages(updatedMessages)

    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ solution: message.content }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate video')
      }

      const data = await response.json()
      
      // Update message with video URL (base64 or S3 URL)
      const finalMessages = [...updatedMessages]
      finalMessages[messageIndex] = {
        ...message,
        videoGenerating: false,
        videoUrl: data.videoUrl || undefined, // Base64 URL for now, S3 URL later
      }
      setMessages(finalMessages)
      
      // Log results
      console.log('Video generation result:', {
        scriptGenerated: !!data.script,
        audioGenerated: data.audioGenerated,
        videoGenerated: data.videoGenerated,
        hasVideoUrl: !!data.videoUrl
      })
    } catch (error) {
      console.error('Error generating video:', error)
      const errorMessages = [...updatedMessages]
      errorMessages[messageIndex] = {
        ...message,
        videoGenerating: false
      }
      setMessages(errorMessages)
    }
  }

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent page refresh
    
    if (!input.trim() || isLoading) return // Don't send empty messages
    
    // 1. Create user message
    const userMessage: Message = { 
      role: "user", 
      content: input,
      timestamp: new Date()
    }
    
    // 2. Add user message to messages immediately (optimistic update)
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    
    // 3. Clear input and reset textarea height
    setInput("")
    if (textareaRef.current) {
      textareaRef.current.style.height = '52px'
    }
    
    // 4. Set loading to true
    setIsLoading(true)
    
    try {
      // 5. Call your API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: updatedMessages }),
      })
      
      if (!response.ok) {
        throw new Error("Failed to get response")
      }
      
      const data = await response.json()
      
      // 6. Add AI response to messages (use updatedMessages, not messages)
      setMessages([...updatedMessages, data.message])
    } catch (error) {
      console.error("Error:", error)
      // Handle error - maybe show an error message to user
      setMessages(updatedMessages) // Keep user message even if API fails
    } finally {
      // 7. Set loading to false
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-900 transition-colors">
      {/* Header with dark mode toggle */}
      <div className="flex justify-end items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Button clicked!')
            toggleDarkMode()
          }}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Toggle dark mode"
          type="button"
        >
          {isDark ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          )}
        </button>
      </div>
      
      {/* Message area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {messages.length === 0 && (
            <div className="text-center text-gray-400 dark:text-gray-500 mt-16">
              <h1 className="text-2xl font-semibold text-black dark:text-white mb-2">Frames</h1>
              <p className="text-gray-500 dark:text-gray-400">How can I help you today?</p>
            </div>
          )}
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-4 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex flex-col gap-2 max-w-[85%] ${
                    message.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  {message.role === 'user' ? (
                    <div className="bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-3 leading-relaxed">
                      {message.content}
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-3 leading-relaxed border border-gray-200 dark:border-gray-700">
                      <div className="mb-3">{message.content}</div>
                      
                      {/* Generate Video Button - Show if no video URL yet */}
                      {!message.videoUrl && (
                        <div className="mt-2">
                          <button
                            onClick={() => handleGenerateVideo(index)}
                            disabled={message.videoGenerating}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {message.videoGenerating ? (
                              <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Generating Video Script...
                              </>
                            ) : (
                              <>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                </svg>
                                Generate Video Solution
                              </>
                            )}
                          </button>
                        </div>
                      )}
                      
                      {/* Video Player */}
                      {message.videoUrl && (
                        <div className="mt-3 rounded-lg overflow-hidden">
                          <video 
                            src={message.videoUrl} 
                            controls 
                            className="w-full max-w-md rounded-lg"
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start gap-4">
                <div className="bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                    <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                // Auto-resize textarea
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto'
                  textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  if (input.trim() && !isLoading) {
                    const form = e.currentTarget.closest('form')
                    form?.requestSubmit()
                  }
                }
              }}
              placeholder="Message Frames..."
              rows={1}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:border-gray-400 dark:focus:border-gray-500 resize-none bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
              disabled={isLoading}
              style={{
                minHeight: '52px',
                maxHeight: '200px',
              }}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 bottom-2 p-2 text-gray-400 dark:text-gray-500 hover:text-black dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              aria-label="Send message"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="transform rotate-360"
              >
                <path
                  d="M10 4L16 10L10 16M16 10H4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 text-center">
            Frames can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  )
}