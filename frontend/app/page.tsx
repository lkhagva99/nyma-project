'use client'

import { useState } from 'react';
import AuthGuard from "./components/AuthGuard";
import TextInput from "./components/TextInput";

export default function Home() {
  const [formData, setFormData] = useState({
    input1: '',
    input2: ''
  })
  const [isLoading, setIsLoading] = useState(false)


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  return (
    <AuthGuard>
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className='grid justify-items-center gap-y-4 shadow-xl bg-white p-8 rounded-xl'>
          <div className='text-black'>
            Main Form
          </div>
          <div className='grid gap-y-2'>
            <TextInput 
              label="Cluster name"
              name="input1"
              type="text"
              placeholder="Enter cluster name"
              value={formData.input1}
              onChange={handleInputChange}
              required
            />
            <TextInput 
              label="Branch name"
              name="input2"
              type="text"
              placeholder="Enter custom branch name"
              value={formData.input2}
              onChange={handleInputChange}
              required
            />
          </div>
          <button 
            type="submit"
            disabled={isLoading}
            className={`
              mt-8 w-full py-3 px-4 rounded-lg font-medium transition-colors
              ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-secondary text-white hover:shadow-lg'
              }
              focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
            `}
          >
            
            {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving config...
                </div>
              ) : (
                'Save config'
              )}
          </button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        Footer
      </footer>
    </div>
    </AuthGuard>
  );
}
