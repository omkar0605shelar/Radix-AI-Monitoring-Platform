import { useState } from 'react';
import { Beaker, FlaskConical, Loader2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateTestCases } from '../services/aiService';

interface AITestCasesProps {
  endpointId: string;
}

const AITestCases = ({ endpointId }: AITestCasesProps) => {
  const [loading, setLoading] = useState(false);
  const [testCasesData, setTestCasesData] = useState<any>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateTestCases(endpointId);
      setTestCasesData(result);
    } catch (err) {
      console.error('Failed to generate test cases', err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, staggerChildren: 0.08 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-premium relative group overflow-hidden mt-10">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-teal-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-teal-500/10 transition-colors" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
            <Beaker className="h-6 w-6 text-teal-400" />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 leading-tight">QA Test Generator</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mt-1">Automated Edge Case Coverage</p>
          </div>
        </div>
        
        <button
          onClick={handleGenerate}
          disabled={loading}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all disabled:opacity-50 shadow-lg active:scale-95 ${
            testCasesData 
              ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-none' 
              : 'bg-teal-600 text-white hover:bg-teal-700 shadow-teal-600/20'
          }`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : testCasesData ? <RefreshCw className="h-4 w-4 mr-2" /> : <FlaskConical className="h-4 w-4 mr-2" />}
          {loading ? 'Synthesizing Tests...' : testCasesData ? 'Regenerate Tests' : 'Generate Test Cases'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 py-12 flex flex-col items-center justify-center text-center"
          >
            <Loader2 className="h-10 w-10 text-teal-500 animate-spin mb-4" />
            <div className="space-y-2 max-w-xs">
              <h4 className="font-bold text-slate-900">Formulating Edge Cases...</h4>
              <p className="text-sm text-slate-400 font-medium">Drafting positive, negative, and boundary test scenarios.</p>
            </div>
          </motion.div>
        ) : testCasesData ? (
          <motion.div key="testContent" variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            
            <div className="grid gap-6">
              {testCasesData.test_cases?.length > 0 ? (
                testCasesData.test_cases.map((test: any, idx: number) => {
                  const isPositive = test.name?.toLowerCase().includes('success') || test.name?.toLowerCase().includes('valid');
                  
                  return (
                    <motion.div key={idx} variants={itemVariants} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {isPositive ? (
                            <CheckCircle className="h-5 w-5 text-emerald-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-rose-500" />
                          )}
                          <h4 className="font-bold text-slate-900">{test.name || \`Test Case #\${idx + 1}\`}</h4>
                        </div>
                      </div>
                      
                      <div className="p-6 space-y-6">
                        <p className="text-sm text-slate-600 font-medium">{test.description}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <div className="text-[10px] uppercase tracking-widest font-black text-slate-400">Mock Input</div>
                            <div className="bg-slate-900 p-4 rounded-xl h-full">
                              <pre className="text-xs font-mono text-teal-400 overflow-x-auto">
                                {typeof test.input === 'string' ? test.input : JSON.stringify(test.input, null, 2)}
                              </pre>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="text-[10px] uppercase tracking-widest font-black text-slate-400">Expected Output</div>
                            <div className="bg-slate-900 p-4 rounded-xl h-full">
                              <pre className="text-xs font-mono text-emerald-300 overflow-x-auto">
                                {typeof test.expected_output === 'string' ? test.expected_output : JSON.stringify(test.expected_output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="bg-slate-50 p-6 text-center rounded-2xl border border-slate-100 text-sm font-medium text-slate-500">
                  Could not generate precise test cases for this schema.
                </div>
              )}
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="emptyState"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center text-center space-y-4"
          >
            <FlaskConical className="h-12 w-12 text-slate-200" />
            <div className="max-w-xs space-y-1">
              <h4 className="font-bold text-slate-900">QA Engine Ready</h4>
              <p className="text-sm text-slate-400 font-medium">
                Generate dynamic test cases to instantly validate input constraints and edge conditions.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AITestCases;
