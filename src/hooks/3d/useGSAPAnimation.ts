'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import * as THREE from 'three';

interface AnimationOptions {
  duration?: number;
  ease?: string;
  repeat?: number;
  yoyo?: boolean;
  delay?: number;
}

export function useGSAPAnimation() {
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const animatePosition = (
    object: THREE.Object3D,
    target: THREE.Vector3,
    options: AnimationOptions = {}
  ) => {
    const {
      duration = 1,
      ease = 'power2.out',
      repeat = 0,
      yoyo = false,
      delay = 0,
    } = options;

    tweenRef.current = gsap.to(object.position, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration,
      ease,
      repeat,
      yoyo,
      delay,
    });

    return tweenRef.current;
  };

  const animateRotation = (
    object: THREE.Object3D,
    target: THREE.Euler,
    options: AnimationOptions = {}
  ) => {
    const {
      duration = 1,
      ease = 'power2.out',
      repeat = 0,
      yoyo = false,
      delay = 0,
    } = options;

    tweenRef.current = gsap.to(object.rotation, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration,
      ease,
      repeat,
      yoyo,
      delay,
    });

    return tweenRef.current;
  };

  const animateScale = (
    object: THREE.Object3D,
    target: THREE.Vector3,
    options: AnimationOptions = {}
  ) => {
    const {
      duration = 1,
      ease = 'elastic.out(1, 0.3)',
      repeat = 0,
      yoyo = false,
      delay = 0,
    } = options;

    tweenRef.current = gsap.to(object.scale, {
      x: target.x,
      y: target.y,
      z: target.z,
      duration,
      ease,
      repeat,
      yoyo,
      delay,
    });

    return tweenRef.current;
  };

  const createTimeline = () => {
    return gsap.timeline();
  };

  const kill = () => {
    if (tweenRef.current) {
      tweenRef.current.kill();
    }
  };

  useEffect(() => {
    return () => {
      kill();
    };
  }, []);

  return {
    animatePosition,
    animateRotation,
    animateScale,
    createTimeline,
    kill,
  };
}
