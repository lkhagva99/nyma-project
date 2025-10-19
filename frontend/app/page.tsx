'use client'

import { useState, ChangeEvent, useEffect } from 'react';
import AuthGuard from "./components/AuthGuard";
import TextInput from "./components/TextInput";
import axios from 'axios';
import SelectInput from './components/SelectInput';

export default function Home() {
  type FormData = {
    olt_option?: string;
    vlan?: string;
    [key: string]: any;
  };
  const [formData, setFormData] = useState<FormData>({});
  const [isLoading, setIsLoading] = useState(false)
  const [oltList, setOltList] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null)
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  const fetchOltNames = async () => {
    try {
      setIsLoading(true)
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND}/olt/get_olt_names`)
      const {data} = response
      setOltList(data.olt_names)
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching OLT names:', error)
    }
  }
  const configureVlan = async () => {
    try {
      if (!formData.olt_option || !formData.vlan) {
        showFor5seconds('Please select an OLT and enter a vlan.')
        return
      }
      
      setIsLoading(true)
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND}/olt/configure_vlan`, formData, {
        headers: {
          "Accept": 'application/json'
        }
      })
      const {data} = response
      console.log('VLAN configured successfully:', data)
      
      // Show success toast
      showToast('VLAN configured successfully!', 'success')
    } catch (error) {
      console.error('Error configuring VLAN:', error)
      // Show error toast
      showToast('Error configuring VLAN. Please try again.', 'error')
    } finally {
      setIsLoading(false)
    }
  }
  const showFor5seconds = (msg: string) => {
    setError(msg)
    setTimeout(() => setError(null), 2000)
  }
  
  const showToast = (message: string, type: 'success' | 'error') => {
    setToastMessage({ message, type })
    setTimeout(() => setToastMessage(null), 3000)
  }
  useEffect(() => { 
    fetchOltNames()
  }, [])
  return (
    <AuthGuard>
    <div className="font-sans grid grid-rows-[auto_1fr_auto] items-center justify-items-center min-h-screen p-6 sm:p-10 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <header className="row-start-1 w-full max-w-3xl flex items-center justify-between">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <span className="text-sm text-slate-500">v1.0</span>
      </header>
      <main className="row-start-2 w-full max-w-3xl">
        <div className='grid gap-6 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-sm p-6 sm:p-8 shadow-[0_6px_30px_rgba(0,0,0,0.06)]'>
          <div>
            <h2 className='text-lg sm:text-xl font-medium text-slate-900'>Main configuration</h2>
            <p className='mt-1 text-sm text-slate-500'>Set up your cluster details to get started.</p>
          </div>
          <div className='grid gap-y-3'>
            <SelectInput
              label="OLT Name"
              options= {oltList.map(name => ({ label: name, value: name }))}
              name="olt_option"
              onChange={(e) => setFormData(prev => ({ ...prev, olt_option: e.target.value }))}
              disabled={isLoading}
              required
            />
            <TextInput 
              label="Vlan"
              name="vlan"
              type="text"
              placeholder="Enter custom vlan name"
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="pt-2">
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            {toastMessage && (
              <div className={`mb-4 border rounded-md p-3 ${
                toastMessage.type === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm ${
                  toastMessage.type === 'success' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>{toastMessage.message}</p>
              </div>
            )}
            <button 
              type="submit"
              disabled={isLoading}
              className={`
                inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-all
                ${isLoading
                  ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-secondary hover:shadow-lg active:scale-[0.99]'
                }
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-white
              `}
              aria-live="polite"
              onClick={() => {
                configureVlan()
              }}
            >
              {isLoading ? (
                <>
                  <span className="relative inline-flex h-5 w-5">
                    <span className="animate-spin h-5 w-5 rounded-full border-2 border-white/60 border-t-transparent"></span>
                  </span>
                  Saving config...
                </>
              ) : (
                'Save config'
              )}
            </button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 w-full max-w-3xl mt-8 flex items-center justify-between text-xs text-slate-500">
        <span>© {new Date().getFullYear()} Nyma</span>
        <div className="flex items-center gap-4">
          <a className="hover:text-slate-700 transition-colors" href="#">Docs</a>
          <a className="hover:text-slate-700 transition-colors" href="#">Support</a>
        </div>
      </footer>
    </div>
    </AuthGuard>
  );
}
