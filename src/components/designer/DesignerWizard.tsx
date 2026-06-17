'use client'

import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDesignerStore } from '@/lib/store/designer'
import StepIndicator from '@/components/ui/StepIndicator'
import BoxCanvas from './BoxCanvas'
import type { BoxCanvasRef } from './BoxCanvas'
import Step1Upload from './Step1Upload'
import Step2CarInfo from './Step2CarInfo'
import Step3Visual from './Step3Visual'
import Step4Preview from './Step4Preview'

const STEP_LABELS = ['Photo', 'Details', 'Colors', 'Preview']

const STEPS = [Step1Upload, Step2CarInfo, Step3Visual]

export default function DesignerWizard() {
  const { step } = useDesignerStore()
  const canvasRef = useRef<BoxCanvasRef>(null)

  const variants = {
    initial: { opacity: 0, x: 40 },
    animate: { opacity: 1, x: 0 },
    exit:    { opacity: 0, x: -40 },
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10 space-y-8">
      <StepIndicator current={step} total={4} labels={STEP_LABELS} />

      {/* Hidden canvas used by all steps */}
      <BoxCanvas ref={canvasRef} />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.22, ease: 'easeOut' }}
        >
          {step === 1 && <Step1Upload />}
          {step === 2 && <Step2CarInfo />}
          {step === 3 && <Step3Visual />}
          {step === 4 && <Step4Preview canvasRef={canvasRef} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
