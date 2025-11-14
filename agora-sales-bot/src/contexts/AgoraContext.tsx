'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient, AIDEN_APP_ID } from 'agora-rtm-react';
import { useClient, useMicrophoneAndCameraTracks } from 'agora-rtc-react';
import { AgoraRTCProvider } from 'agora-rtc-react';
import { agoraConfig } from '@/config/agora.config';

type AgoraContextType = {
  isConnected: boolean;
  isCallActive: boolean;
  localAudioTrack: any;
  localVideoTrack: any;
  joinCall: (channel: string, token?: string) => Promise<void>;
  leaveCall: () => Promise<void>;
  sendMessage: (text: string) => Promise<void>;
  messages: Array<{
    text: string;
    isLocal: boolean;
    timestamp: Date;
  }>;
};

const AgoraContext = createContext<AgoraContextType | undefined>(undefined);

// Initialize RTM client
const useRtmClient = createClient(agoraConfig.appId);

// Initialize RTC client
const useRtcClient = () => {
  const client = useClient({ mode: 'rtc', codec: 'vp8' });
  return client;
};

export const AgoraProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const rtmClient = useRtmClient();
  const rtcClient = useRtcClient();
  const { ready, tracks } = useMicrophoneAndCameraTracks();
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [messages, setMessages] = useState<Array<{ text: string; isLocal: boolean; timestamp: Date }>>([]);

  // Connect to Agora RTM
  const connectToAgora = async () => {
    try {
      await rtmClient.login({ token: null, uid: `user_${Math.random().toString(36).substr(2, 9)}` });
      setIsConnected(true);
      console.log('Connected to Agora RTM');
    } catch (error) {
      console.error('Failed to connect to Agora RTM:', error);
    }
  };

  // Join a voice/video call
  const joinCall = async (channel: string, token?: string) => {
    try {
      await rtcClient.join(
        agoraConfig.appId,
        channel,
        token || null,
        `user_${Math.random().toString(36).substr(2, 9)}`
      );
      
      if (tracks) {
        await rtcClient.publish([tracks[0], tracks[1]]);
      }
      
      setIsCallActive(true);
      console.log('Joined call successfully');
    } catch (error) {
      console.error('Failed to join call:', error);
    }
  };

  // Leave the current call
  const leaveCall = async () => {
    try {
      if (tracks) {
        tracks[0].stop();
        tracks[0].close();
        tracks[1].stop();
        tracks[1].close();
      }
      
      await rtcClient.leave();
      setIsCallActive(false);
      console.log('Left the call');
    } catch (error) {
      console.error('Failed to leave call:', error);
    }
  };

  // Send a text message
  const sendMessage = async (text: string) => {
    try {
      await rtmClient.sendMessageToPeer(
        { text },
        'peer_id', // Replace with actual peer ID or channel name
        { enableHistoricalMessaging: true }
      );
      
      setMessages(prev => [...prev, { text, isLocal: true, timestamp: new Date() }]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  // Set up message listener
  useEffect(() => {
    const handleMessage = (message: any, peerId: string) => {
      setMessages(prev => [...prev, { 
        text: message.text, 
        isLocal: false, 
        timestamp: new Date() 
      }]);
    };

    rtmClient.on('MessageFromPeer', handleMessage);
    
    return () => {
      rtmClient.off('MessageFromPeer', handleMessage);
    };
  }, [rtmClient]);

  // Connect to Agora on mount
  useEffect(() => {
    connectToAgora();
    
    return () => {
      if (isConnected) {
        rtmClient.logout();
      }
      
      if (isCallActive) {
        leaveCall();
      }
    };
  }, []);

  return (
    <AgoraRTCProvider client={rtcClient}>
      <AgoraContext.Provider
        value={{
          isConnected,
          isCallActive,
          localAudioTrack: tracks?.[0],
          localVideoTrack: tracks?.[1],
          joinCall,
          leaveCall,
          sendMessage,
          messages,
        }}
      >
        {children}
      </AgoraContext.Provider>
    </AgoraRTCProvider>
  );
};

export const useAgora = (): AgoraContextType => {
  const context = useContext(AgoraContext);
  if (context === undefined) {
    throw new Error('useAgora must be used within an AgoraProvider');
  }
  return context;
};
