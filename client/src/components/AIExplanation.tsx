import { useState } from 'react';
import { Sparkles, Brain, Code, Lightbulb, Loader2, BookOpen, Info } from 'lucide-react';
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
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const renderContent = (content: any) => {
    if (!content) return '';
    if (typeof content === 'string') return content;
    return Object.entries(content).map(([k, v]) => `${k}: ${v}`).join(' | ');
  };

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative group">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
        <Brain className="h-32 w-32" />
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg leading-tight">AI Insights</h3>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Powered by GPT-4</p>
          </div>
        </div>
        
        {!explanation && (
          <button
            onClick={handleExplain}
            disabled={loading}
            className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-2 rounded-xl font-bold text-sm flex items-center justify-center transition-all disabled:opacity-50 shadow-lg shadow-primary/20 active:scale-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
            Analyze Endpoint
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4 py-8"
          >
            <div className="h-4 bg-muted animate-pulse rounded-full w-3/4" />
            <div className="h-4 bg-muted animate-pulse rounded-full w-full" />
            <div className="h-4 bg-muted animate-pulse rounded-full w-5/6" />
            <p className="text-center text-sm text-muted-foreground mt-4 italic">Consulting the oracle...</p>
          </motion.div>
        ) : explanation ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* Purpose Section */}
            <motion.div variants={itemVariants} className="space-y-2">
              <div className="flex items-center gap-2 text-primary">
                <Info className="h-4 w-4" />
                <h4 className="text-sm font-bold uppercase tracking-wide">Purpose</h4>
              </div>
              <p className="text-foreground leading-relaxed">
                {renderContent(explanation.purpose)}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Request Explanation */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center gap-2 text-blue-500">
                  <Code className="h-4 w-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wide">Request Payload</h4>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {renderContent(explanation.request_explanation)}
                </p>
              </motion.div>

              {/* Response Explanation */}
              <motion.div variants={itemVariants} className="space-y-2">
                <div className="flex items-center gap-2 text-green-500">
                  <CheckCircle2 className="h-4 w-4" />
                  <h4 className="text-sm font-bold uppercase tracking-wide">Expected Response</h4>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {renderContent(explanation.response_explanation)}
                </p>
              </motion.div>
            </div>

            {/* Use Case Section */}
            <motion.div variants={itemVariants} className="bg-muted/30 p-4 rounded-xl border border-border/50">
              <div className="flex items-center gap-2 text-yellow-500 mb-2">
                <Lightbulb className="h-4 w-4" />
                <h4 className="text-sm font-bold uppercase tracking-wide">Common Use Case</h4>
              </div>
              <p className="text-foreground/80 text-sm italic italic leading-relaxed">
                "{renderContent(explanation.use_case)}"
              </p>
            </motion.div>
            
            <motion.button
              variants={itemVariants}
              onClick={handleExplain}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
            >
              <RefreshCw className="h-3 w-3" />
              Regenerate Analysis
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-12 border border-dashed border-border rounded-xl bg-muted/10 flex flex-col items-center justify-center text-center space-y-3"
          >
            <BookOpen className="h-10 w-10 text-muted-foreground opacity-20" />
            <div className="max-w-xs">
              <h4 className="font-semibold">Endpoint Analysis Ready</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Get an instant breakdown of this endpoint's logic, parameters, and common usage patterns.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Add missing imports for the final component
import { RefreshCw, CheckCircle2 } from 'lucide-react';

export default AIExplanation;
