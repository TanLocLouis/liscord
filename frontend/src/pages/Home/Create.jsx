import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import './Create.css';

import Switch from '@/components/Switch/Switch';
import AutoResizeTextarea from '@/components/AutoResizeTextarea/AutoResizeTextarea';
import Button from '../../components/Button/Button';

import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { fetchWithAuth } from '../../utils/fetchWithAuth';

function Create() {
  const { addToast } = useToast();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      addToast("info", "You must be logged in to use Liscord");
      navigate("/sign-up");
    }
  }, [userInfo]);

  return (
    <div>
      <h1>Hi</h1>
      <h1>Hi</h1>
      <h1>Hi</h1>
      <h1>Hi</h1>
      <h1>Hi</h1>
    </div>
  )
}

export default Create;