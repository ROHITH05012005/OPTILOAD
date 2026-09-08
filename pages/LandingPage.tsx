import React from 'react';
import { Landing } from './Landing';
import { LandingChatbot } from '../components/LandingChatbot';

export const LandingPage: React.FC = () => {
  return (
    <>
      <Landing />
      <LandingChatbot />
    </>
  );
};
