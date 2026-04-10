import { useState } from 'react';
import { Brain, Code, Lightbulb, Loader2, BookOpen, Info, RefreshCw, CheckCircle2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { explainEndpoint } from '../services/aiService';
import { useDispatch } from 'react-redux';
import { setAiExplanation } from '../redux/slices/endpointSlice';

interface AIExplanationProps {
  endpointId: string;
  initialExplanation?: any;
}

const AIExplanation = ({ endpointId, initialExplanation }: AIExplanationProps) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<any>(initialExplanation);
  const dispatch = useDispatch();

  const handleExplain = async () => {
    setLoading(true);
    try {
      const result = await explainEndpoint(endpointId);
      setExplanation(result);
      dispatch(setAiExplanation({ endpointId, explanation: result }));
    } catch (err) {
      console.error('Failed to get AI explanation', err);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.4,
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -5 },
    visible: { opacity: 1, x: 0 }
  };

  const renderContent = (content: any) => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return Object.entries(content).map(([k, v]) => `${k}: ${v}`).join(' | ');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-premium relative group overflow-hidden">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 h-40 w-40 bg-primary/5 rounded-full blur-3xl pointer-events-none group-hover:bg-primary/10 transition-colors" />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-black text-xl text-slate-900 leading-tight">NVIDIA Intelligence</h3>
            <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-black mt-1">Llama 3.1 70B Analysis</p>
          </div>
        </div>
        
        <button
          onClick={handleExplain}
          disabled={loading}
          className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center transition-all disabled:opacity-50 shadow-lg active:scale-95 ${
            explanation 
              ? 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 shadow-none' 
              : 'bg-primary text-white hover:bg-primary/90 shadow-primary/20'
          }`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : explanation ? <RefreshCw className="h-4 w-4 mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
          {loading ? 'Analyzing...' : explanation ? 'Regenerate Analysis' : 'Analyze Endpoint'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 py-12 flex flex-col items-center justify-center text-center"
          >
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <div className="space-y-2 max-w-xs">
              <h4 className="font-bold text-slate-900">Processing Node...</h4>
              <p className="text-sm text-slate-400 font-medium">Decoding API patterns and generating technical documentation.</p>
            </div>
          </motion.div>
        ) : explanation ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Purpose Section */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2 text-primary">
                <Info className="h-4 w-4" />
                <h4 className="text-[12px] font-black uppercase tracking-widest">Logic Breakdown</h4>
              </div>
              <p className="text-slate-700 font-bold text-lg leading-snug">
                {renderContent(explanation.purpose)}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Request Explanation */}
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center gap-2 text-blue-500">
                  <Code className="h-4 w-4" />
                  <h4 className="text-[12px] font-black uppercase tracking-widest">Request Model</h4>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  {renderContent(explanation.request_explanation)}
                </p>
              </motion.div>

              {/* Response Explanation */}
              <motion.div variants={itemVariants} className="space-y-3">
                <div className="flex items-center gap-2 text-emerald-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <h4 className="text-[12px] font-black uppercase tracking-widest">Expected Result</h4>
                </div>
                <p className="text-slate-500 text-sm font-medium leading-relaxed bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                  {renderContent(explanation.response_explanation)}
                </p>
              </motion.div>
            </div>

            {/* Use Case Section */}
            <motion.div variants={itemVariants} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl shadow-slate-200">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Lightbulb className="h-4 w-4" />
                <h4 className="text-[12px] font-black uppercase tracking-widest">Implementation Scenario</h4>
              </div>
              <p className="text-slate-200 text-sm font-medium leading-relaxed italic">
                "{renderContent(explanation.use_case)}"
              </p>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-16 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30 flex flex-col items-center justify-center text-center space-y-4"
          >
            <BookOpen className="h-12 w-12 text-slate-200" />
            <div className="max-w-xs space-y-1">
              <h4 className="font-bold text-slate-900">Intelligence Node Ready</h4>
              <p className="text-sm text-slate-400 font-medium">
                Initiate a deep crawl of this endpoint to unlock AI-powered logic summaries.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIExplanation;
