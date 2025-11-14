// Agora Configuration
export const agoraConfig = {
  // Agora App ID - Get this from Agora Console
  appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || 'YOUR_AGORA_APP_ID',
  
  // Agora Customer ID (if required)
  customerId: process.env.NEXT_PUBLIC_AGORA_CUSTOMER_ID || 'YOUR_CUSTOMER_ID',
  
  // Agora Customer Certificate (if required)
  customerCertificate: process.env.NEXT_PUBLIC_AGORA_CERTIFICATE || 'YOUR_CERTIFICATE',
  
  // Token expiration time in seconds (default: 1 hour)
  tokenExpirationTime: 3600,
  
  // Chat configuration
  chat: {
    // Enable/disable chat features
    enabled: true,
    
    // Default chat room name
    defaultRoom: 'sales-support',
    
    // Message history limit
    messageLimit: 100,
  },
  
  // Voice/Video configuration
  rtc: {
    // Enable/disable voice/video features
    enabled: true,
    
    // Codec settings
    codec: 'vp8', // or 'h264'
    
    // Audio settings
    audio: {
      codec: 'aac',
      sampleRate: 48000,
      channels: 2,
    },
    
    // Video settings
    video: {
      width: 640,
      height: 360,
      frameRate: 15,
      bitrateMin: 200,
      bitrateMax: 400,
    },
  },
};

export default agoraConfig;
