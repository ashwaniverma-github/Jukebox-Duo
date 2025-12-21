import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'

export function DonationModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [pulseHeart, setPulseHeart] = useState(false)

  useEffect(() => {
    // Check if the donation modal has been shown in this session
    const hasShownDonationModal = sessionStorage.getItem('donationModalShown')

    if (!hasShownDonationModal) {
      setIsOpen(true)
      // Mark that the donation modal has been shown
      sessionStorage.setItem('donationModalShown', 'true')

      const interval = setInterval(() => {
        setPulseHeart(true)
        setTimeout(() => setPulseHeart(false), 100)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [])

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-2 border-yellow-500 text-white">
        <DialogHeader>
          <div className="flex justify-center mb-3">
            <div className={`text-5xl transition-transform duration-300 ${pulseHeart ? 'scale-125' : 'scale-100'}`}>
              🎵
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-center text-yellow-400">
            Support Jukebox Duo
          </DialogTitle>
          <DialogDescription className="text-center text-gray-300 text-sm mt-2">
            Help us keep the music playing for everyone
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <p className="text-gray-200 text-center text-sm leading-relaxed">
              <span className="font-semibold text-white">Jukebox Duo</span> is a passion project built by an indie developer.
              Your support helps me keep the servers running, add new features, and maintain an ad-free experience.
            </p>
          </div>

          <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-xl font-bold text-yellow-400">10K+</div>
                <div className="text-xs text-gray-400">Songs played</div>
              </div>
              <div>
                <div className="text-xl font-bold text-yellow-400">1K+</div>
                <div className="text-xs text-gray-400">Users</div>
              </div>
              <div>
                <div className="text-xl font-bold text-yellow-400">24/7</div>
                <div className="text-xs text-gray-400">Uptime</div>
              </div>
            </div>
          </div>

          <form
            action="https://www.paypal.com/ncp/payment/BHH3LHQ3XLU48"
            method="post"
            target="_blank"
            className="w-full"
          >
            <button
              type="submit"
              className="w-full cursor-pointer bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl p-4 text-lg transition-all duration-500 hover:scale-105 shadow-lg"
            >
              💝 Donate Now
            </button>
          </form>

          <p className="text-xs text-center text-gray-400">
            🔒 Secure payment via PayPal • No recurring charges
          </p>
        </div>

        <div className="mt-3 text-center">
          <Button
            variant="ghost"
            className="text-gray-400 hover:bg-gray-800 hover:text-white text-sm"
            onClick={handleClose}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}