'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatBot from './ChatBot';

// Animation phases for the avatar sequence
type AnimationPhase =
    | 'entry'
    | 'walkLeft'
    | 'wave'
    | 'walkRight'
    | 'sunglassesOn'
    | 'coolPose'
    | 'walkCenter'
    | 'thinking'
    | 'thumbsUp'
    | 'peaceSign'
    | 'jump'
    | 'surprised'
    | 'rest'
    | 'idle';

// Professional cartoon-style avatar SVG component with smooth animations
function AvatarCharacter({
    isWalking,
    isWaving,
    facingRight,
    walkCycle,
    hasSunglasses,
    isCoolPose,
    isThinking,
    isThumbsUp,
    isPeaceSign,
    isJumping,
    isSurprised,
    isHovered
}: {
    isWalking: boolean;
    isWaving: boolean;
    facingRight: boolean;
    walkCycle: number;
    hasSunglasses: boolean;
    isCoolPose: boolean;
    isThinking: boolean;
    isThumbsUp: boolean;
    isPeaceSign: boolean;
    isJumping: boolean;
    isSurprised: boolean;
    isHovered: boolean;
}) {
    const [blink, setBlink] = useState(false);

    // Blinking animation - don't blink with sunglasses or when surprised
    useEffect(() => {
        if (hasSunglasses || isSurprised) return;
        const blinkInterval = setInterval(() => {
            setBlink(true);
            setTimeout(() => setBlink(false), 150);
        }, 3000 + Math.random() * 2000);
        return () => clearInterval(blinkInterval);
    }, [hasSunglasses, isSurprised]);

    // Calculate leg positions based on walk cycle
    let leftLegRotation = isWalking ? Math.sin(walkCycle) * 30 : 0;
    let rightLegRotation = isWalking ? Math.sin(walkCycle + Math.PI) * 30 : 0;

    // Jumping legs tuck up
    if (isJumping) {
        leftLegRotation = 20;
        rightLegRotation = -20;
    }

    // Arm positions for different poses
    let leftArmRotation = isWalking ? Math.sin(walkCycle + Math.PI) * 25 : 0;
    let rightArmRotation = isWalking ? Math.sin(walkCycle) * 25 : 0;

    if (isWaving) {
        rightArmRotation = 0;
    }
    if (isCoolPose) {
        leftArmRotation = 15;
        rightArmRotation = -15;
    }
    if (isThinking) {
        rightArmRotation = -60;
    }
    if (isThumbsUp) {
        rightArmRotation = -50;
    }
    if (isPeaceSign) {
        rightArmRotation = -55;
    }
    if (isJumping || isSurprised) {
        leftArmRotation = -30;
        rightArmRotation = -30;
    }

    // Body bob for walking
    const bodyBob = isWalking ? Math.abs(Math.sin(walkCycle * 2)) * 3 : 0;

    // Head slight tilt
    let headTilt = isWalking ? Math.sin(walkCycle) * 3 : 0;
    if (isCoolPose) headTilt = 5;
    if (isThinking) headTilt = -8;
    if (isSurprised) headTilt = 0;

    // Waving animation timing
    const waveRotation = isWaving ? -45 + Math.sin(Date.now() / 100) * 20 : 0;

    // Eye size for surprised
    const eyeScaleY = isSurprised ? 1.4 : 1;

    return (
        <motion.svg
            width="70"
            height="100"
            viewBox="0 0 70 100"
            style={{
                transform: facingRight ? 'scaleX(1)' : 'scaleX(-1)',
                filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.2))'
            }}
            animate={{
                scale: isHovered ? 1.1 : 1,
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
            <defs>
                {/* Skin gradient - warm tone */}
                <linearGradient id="skinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFDAB9" />
                    <stop offset="50%" stopColor="#F5C6A5" />
                    <stop offset="100%" stopColor="#E5B090" />
                </linearGradient>

                {/* Hair gradient - dark brown */}
                <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4A3728" />
                    <stop offset="100%" stopColor="#2E221A" />
                </linearGradient>

                {/* Shirt gradient - indigo/purple professional look */}
                <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>

                {/* Pants gradient - professional dark */}
                <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4B5563" />
                    <stop offset="100%" stopColor="#374151" />
                </linearGradient>

                {/* Shoe gradient */}
                <linearGradient id="shoeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>

                {/* Sunglasses gradient */}
                <linearGradient id="glassesGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1F2937" />
                    <stop offset="50%" stopColor="#374151" />
                    <stop offset="100%" stopColor="#1F2937" />
                </linearGradient>

                {/* Shadow filter */}
                <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="1" floodOpacity="0.2" />
                </filter>
            </defs>

            {/* Body group with bob animation */}
            <g transform={`translate(0, ${-bodyBob})`}>
                {/* Shadow under feet */}
                <ellipse
                    cx="35"
                    cy="98"
                    rx={isWalking ? 14 : (isJumping ? 10 : 16)}
                    ry={isJumping ? 2 : 3}
                    fill={`rgba(0,0,0,${isJumping ? 0.08 : 0.15})`}
                />

                {/* Left Leg */}
                <g
                    style={{
                        transformOrigin: '28px 58px',
                        transform: `rotate(${leftLegRotation}deg)`
                    }}
                >
                    <rect x="23" y="58" width="10" height="18" rx="5" fill="url(#pantsGrad)" />
                    <rect x="23" y="74" width="10" height="16" rx="5" fill="url(#pantsGrad)" />
                    <ellipse cx="28" cy="92" rx="7" ry="4" fill="url(#shoeGrad)" />
                    <rect x="21" y="93" width="14" height="3" rx="1.5" fill="#1F2937" />
                </g>

                {/* Right Leg */}
                <g
                    style={{
                        transformOrigin: '42px 58px',
                        transform: `rotate(${rightLegRotation}deg)`
                    }}
                >
                    <rect x="37" y="58" width="10" height="18" rx="5" fill="url(#pantsGrad)" />
                    <rect x="37" y="74" width="10" height="16" rx="5" fill="url(#pantsGrad)" />
                    <ellipse cx="42" cy="92" rx="7" ry="4" fill="url(#shoeGrad)" />
                    <rect x="35" y="93" width="14" height="3" rx="1.5" fill="#1F2937" />
                </g>

                {/* Torso / Professional Shirt */}
                <path
                    d="M23 38 Q20 58 24 62 L46 62 Q50 58 47 38 Q47 32 35 30 Q23 32 23 38"
                    fill="url(#shirtGrad)"
                    filter="url(#shadow)"
                />

                {/* Shirt collar / V-neck detail */}
                <path
                    d="M30 32 L35 38 L40 32"
                    stroke="#4F46E5"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                />

                {/* Belt */}
                <rect x="22" y="56" width="26" height="4" rx="1" fill="#374151" />
                <rect x="32" y="55" width="6" height="6" rx="1" fill="#9CA3AF" />

                {/* Left Arm */}
                <g
                    style={{
                        transformOrigin: '24px 40px',
                        transform: `rotate(${leftArmRotation}deg)`,
                        transition: 'transform 0.2s ease-out'
                    }}
                >
                    <ellipse cx="19" cy="42" rx="6" ry="8" fill="url(#shirtGrad)" />
                    <rect x="14" y="48" width="8" height="14" rx="4" fill="url(#skinGrad)" />
                    <ellipse cx="18" cy="64" rx="5" ry="4" fill="url(#skinGrad)" />
                </g>

                {/* Right Arm - Multiple poses */}
                <g
                    style={{
                        transformOrigin: '46px 40px',
                        transform: `rotate(${isWaving ? waveRotation : rightArmRotation}deg)`,
                        transition: 'transform 0.2s ease-out'
                    }}
                >
                    <ellipse cx="51" cy="42" rx="6" ry="8" fill="url(#shirtGrad)" />
                    <g
                        style={{
                            transformOrigin: '52px 48px',
                            transform: isWaving ? 'rotate(-20deg)' : (isThinking ? 'rotate(-70deg)' : 'rotate(0deg)')
                        }}
                    >
                        <rect x="48" y="48" width="8" height="14" rx="4" fill="url(#skinGrad)" />
                        <g transform="translate(52, 64)">
                            <ellipse cx="0" cy="0" rx="5" ry="4" fill="url(#skinGrad)" />

                            {/* Waving fingers */}
                            {isWaving && (
                                <>
                                    <rect x="-3" y="-2" width="2" height="6" rx="1" fill="url(#skinGrad)" />
                                    <rect x="0" y="-3" width="2" height="7" rx="1" fill="url(#skinGrad)" />
                                    <rect x="3" y="-2" width="2" height="6" rx="1" fill="url(#skinGrad)" />
                                </>
                            )}

                            {/* Thumbs up */}
                            {isThumbsUp && (
                                <>
                                    <rect x="-1" y="-8" width="3" height="8" rx="1.5" fill="url(#skinGrad)" />
                                    <rect x="-4" y="-2" width="8" height="4" rx="2" fill="url(#skinGrad)" />
                                </>
                            )}

                            {/* Peace sign */}
                            {isPeaceSign && (
                                <>
                                    <rect x="-2" y="-10" width="2.5" height="10" rx="1" fill="url(#skinGrad)" />
                                    <rect x="1" y="-9" width="2.5" height="9" rx="1" fill="url(#skinGrad)" />
                                    <rect x="-4" y="-2" width="8" height="5" rx="2" fill="url(#skinGrad)" />
                                </>
                            )}
                        </g>
                    </g>
                </g>

                {/* Neck */}
                <rect x="32" y="26" width="6" height="6" rx="2" fill="url(#skinGrad)" />

                {/* Head Group with subtle tilt */}
                <g
                    style={{
                        transformOrigin: '35px 18px',
                        transform: `rotate(${headTilt}deg)`
                    }}
                >
                    {/* Head base */}
                    <ellipse cx="35" cy="16" rx="14" ry="16" fill="url(#skinGrad)" />

                    {/* Ears */}
                    <ellipse cx="21" cy="18" rx="3" ry="5" fill="url(#skinGrad)" />
                    <ellipse cx="49" cy="18" rx="3" ry="5" fill="url(#skinGrad)" />

                    {/* Hair - styled modern look */}
                    <path
                        d="M21 14 Q21 2 35 2 Q49 2 49 14 Q49 10 42 9 Q35 8 28 9 Q21 10 21 14"
                        fill="url(#hairGrad)"
                    />
                    <path
                        d="M26 4 Q30 1 38 3"
                        stroke="#3D2E23"
                        strokeWidth="3"
                        fill="none"
                        strokeLinecap="round"
                    />
                    <path d="M21 14 Q19 20 21 24" stroke="url(#hairGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />
                    <path d="M49 14 Q51 20 49 24" stroke="url(#hairGrad)" strokeWidth="4" fill="none" strokeLinecap="round" />

                    {/* Eyes or Sunglasses */}
                    {hasSunglasses ? (
                        // Cool sunglasses
                        <g>
                            <rect x="23" y="14" rx="3" ry="3" width="10" height="8" fill="url(#glassesGrad)" />
                            <rect x="37" y="14" rx="3" ry="3" width="10" height="8" fill="url(#glassesGrad)" />
                            <rect x="33" y="16" width="4" height="2" fill="#1F2937" />
                            <rect x="21" y="16" width="3" height="2" fill="#1F2937" />
                            <rect x="46" y="16" width="3" height="2" fill="#1F2937" />
                            <rect x="25" y="15" width="3" height="1.5" rx="0.5" fill="rgba(255,255,255,0.3)" />
                            <rect x="39" y="15" width="3" height="1.5" rx="0.5" fill="rgba(255,255,255,0.3)" />
                        </g>
                    ) : (
                        // Normal eyes (with surprised variant)
                        <g style={{ transform: `scaleY(${eyeScaleY})`, transformOrigin: '35px 18px' }}>
                            <ellipse cx="29" cy="18" rx="4" ry={blink ? 0.5 : 3.5} fill="white" />
                            {!blink && (
                                <>
                                    <ellipse cx="30" cy="18" rx={isSurprised ? 2.5 : 2} ry={isSurprised ? 3 : 2.5} fill="#2D1B0E" />
                                    <circle cx="31" cy="17" r="0.8" fill="white" />
                                </>
                            )}

                            <ellipse cx="41" cy="18" rx="4" ry={blink ? 0.5 : 3.5} fill="white" />
                            {!blink && (
                                <>
                                    <ellipse cx="42" cy="18" rx={isSurprised ? 2.5 : 2} ry={isSurprised ? 3 : 2.5} fill="#2D1B0E" />
                                    <circle cx="43" cy="17" r="0.8" fill="white" />
                                </>
                            )}
                        </g>
                    )}

                    {/* Eyebrows - adjust for expressions */}
                    {isSurprised ? (
                        // Raised eyebrows for surprise
                        <>
                            <path d="M25 11 Q29 9 33 11" stroke="#3D2314" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            <path d="M37 11 Q41 9 45 11" stroke="#3D2314" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                        </>
                    ) : (
                        <>
                            <path
                                d={isCoolPose || hasSunglasses ? "M25 12 Q29 11 33 13" : "M25 14 Q29 12 33 14"}
                                stroke="#3D2314"
                                strokeWidth="1.2"
                                fill="none"
                                strokeLinecap="round"
                            />
                            <path
                                d={isCoolPose || hasSunglasses ? "M37 13 Q41 11 45 12" : "M37 14 Q41 12 45 14"}
                                stroke="#3D2314"
                                strokeWidth="1.2"
                                fill="none"
                                strokeLinecap="round"
                            />
                        </>
                    )}

                    {/* Nose */}
                    <path d="M35 20 Q36 22 35 24" stroke="#D4A088" strokeWidth="1.5" fill="none" strokeLinecap="round" />

                    {/* Mouth - different expressions */}
                    {isSurprised ? (
                        // Surprised O mouth
                        <ellipse cx="35" cy="28" rx="3" ry="4" fill="#C4786A" />
                    ) : isCoolPose || hasSunglasses ? (
                        // Cool smirk
                        <path
                            d="M32 27 Q38 30 42 26"
                            stroke="#C4786A"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />
                    ) : isThinking ? (
                        // Thinking expression
                        <ellipse cx="36" cy="28" rx="2" ry="1.5" fill="#C4786A" />
                    ) : isThumbsUp || isPeaceSign || isJumping ? (
                        // Happy grin
                        <path
                            d="M29 26 Q35 33 41 26"
                            stroke="#C4786A"
                            strokeWidth="2"
                            fill="none"
                            strokeLinecap="round"
                        />
                    ) : (
                        // Normal smile
                        <path
                            d={isWaving ? "M30 27 Q35 31 40 27" : "M31 27 Q35 30 39 27"}
                            stroke="#C4786A"
                            strokeWidth="1.8"
                            fill="none"
                            strokeLinecap="round"
                        />
                    )}

                    {/* Cheek blush - more visible when happy */}
                    <ellipse
                        cx="24" cy="23"
                        rx="2.5" ry="1.5"
                        fill="#FFB5A0"
                        opacity={isJumping || isThumbsUp || isPeaceSign ? 0.6 : 0.4}
                    />
                    <ellipse
                        cx="46" cy="23"
                        rx="2.5" ry="1.5"
                        fill="#FFB5A0"
                        opacity={isJumping || isThumbsUp || isPeaceSign ? 0.6 : 0.4}
                    />

                    {/* Thinking hand near chin */}
                    {isThinking && (
                        <ellipse cx="38" cy="30" rx="4" ry="3" fill="url(#skinGrad)" />
                    )}
                </g>
            </g>
        </motion.svg>
    );
}

// Speech bubble component with different messages
function SpeechBubble({ visible, message }: { visible: boolean; message: string }) {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: 10 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="absolute -top-14 left-1/2 -translate-x-1/2 whitespace-nowrap z-10"
                >
                    <div className="relative bg-white dark:bg-neutral-800 px-4 py-2.5 rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-700">
                        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                            {message}
                        </span>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                            <svg width="16" height="8" viewBox="0 0 16 8">
                                <path d="M0 0 L8 8 L16 0" fill="white" className="dark:fill-neutral-800" />
                                <path d="M0 0 L8 8 L16 0" fill="none" stroke="rgb(229 231 235)" className="dark:stroke-neutral-700" strokeWidth="1" />
                            </svg>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Idle breathing animation hook
function useBreathing(isIdle: boolean) {
    const [breath, setBreath] = useState(0);

    useEffect(() => {
        if (!isIdle) return;

        const interval = setInterval(() => {
            setBreath(prev => prev + 0.05);
        }, 50);

        return () => clearInterval(interval);
    }, [isIdle]);

    return Math.sin(breath) * 2;
}

// Available messages for different poses
const messages = {
    wave: "Hello! 👋 Welcome!",
    cool: "Looking cool! 😎",
    thinking: "Hmm... 🤔",
    thumbsUp: "You got this! 👍",
    peace: "Stay awesome! ✌️",
    jump: "Woohoo! 🎉",
    surprised: "Oh! Hi there! 😮",
    hover: "Hey! Click me! 👆",
};

export default function WalkingAvatar() {
    const [phase, setPhase] = useState<AnimationPhase>('entry');
    const [position, setPosition] = useState(280);
    const [facingRight, setFacingRight] = useState(false);
    const [walkCycle, setWalkCycle] = useState(0);
    const [showBubble, setShowBubble] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(messages.wave);
    const [idleSceneIndex, setIdleSceneIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [jumpOffset, setJumpOffset] = useState(0);
    const [previousPhase, setPreviousPhase] = useState<AnimationPhase>('idle');
    const [isChatOpen, setIsChatOpen] = useState(false);

    const isWalking = phase === 'walkLeft' || phase === 'walkRight' || phase === 'walkCenter';
    const isWaving = phase === 'wave';
    const hasSunglasses = phase === 'sunglassesOn' || phase === 'coolPose';
    const isCoolPose = phase === 'coolPose';
    const isThinking = phase === 'thinking';
    const isThumbsUp = phase === 'thumbsUp';
    const isPeaceSign = phase === 'peaceSign';
    const isJumping = phase === 'jump';
    const isSurprised = phase === 'surprised';
    const isIdle = phase === 'rest' || phase === 'idle';

    const breathOffset = useBreathing(isIdle && !isHovered);

    // Walk cycle animation
    useEffect(() => {
        if (!isWalking) return;

        const interval = setInterval(() => {
            setWalkCycle(prev => prev + 0.25);
        }, 16);

        return () => clearInterval(interval);
    }, [isWalking]);

    // Jump animation
    useEffect(() => {
        if (!isJumping) {
            setJumpOffset(0);
            return;
        }

        const startTime = Date.now();
        const jumpDuration = 400;
        const jumpHeight = 25;

        const animateJump = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / jumpDuration, 1);
            // Parabolic jump curve
            const jumpProgress = Math.sin(progress * Math.PI);
            setJumpOffset(jumpProgress * jumpHeight);

            if (progress < 1) {
                requestAnimationFrame(animateJump);
            }
        };
        requestAnimationFrame(animateJump);
    }, [isJumping]);

    // Handle hover - trigger reaction
    const handleMouseEnter = useCallback(() => {
        setIsHovered(true);

        // Only react if in idle phase
        if (phase === 'idle' || phase === 'rest') {
            setPreviousPhase(phase);
            setPhase('surprised');
            setCurrentMessage(messages.surprised);
            setShowBubble(true);

            // After surprise, do a little jump
            setTimeout(() => {
                setPhase('jump');
                setCurrentMessage(messages.jump);
            }, 800);

            // Then wave
            setTimeout(() => {
                setPhase('wave');
                setCurrentMessage(messages.hover);
            }, 1300);
        }
    }, [phase]);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);

        // Return to idle after a moment
        if (phase === 'wave' || phase === 'jump' || phase === 'surprised') {
            setTimeout(() => {
                setShowBubble(false);
                setTimeout(() => setPhase('idle'), 300);
            }, 500);
        }
    }, [phase]);

    // Handle click - cycle through poses
    const handleClick = useCallback(() => {
        const clickPoses: AnimationPhase[] = ['thumbsUp', 'peaceSign', 'coolPose', 'wave'];
        const clickMessages = [messages.thumbsUp, messages.peace, messages.cool, messages.wave];

        const currentIndex = clickPoses.indexOf(phase);
        const nextIndex = (currentIndex + 1) % clickPoses.length;

        setPhase(clickPoses[nextIndex]);
        setCurrentMessage(clickMessages[nextIndex]);
        setShowBubble(true);

        setTimeout(() => {
            setShowBubble(false);
        }, 2000);
    }, [phase]);

    // Handle chat toggle
    const handleChatToggle = useCallback(() => {
        setIsChatOpen(prev => !prev);
    }, []);

    const handleChatClose = useCallback(() => {
        setIsChatOpen(false);
    }, []);

    // Animate position helper
    const animatePosition = (startPos: number, endPos: number, duration: number): Promise<void> => {
        return new Promise((resolve) => {
            const startTime = Date.now();

            const frame = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 2);
                setPosition(startPos + (endPos - startPos) * eased);

                if (progress < 1) {
                    requestAnimationFrame(frame);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(frame);
        });
    };

    // Main animation sequence
    useEffect(() => {
        const runSequence = async () => {
            // Scene 1: Entry
            setPhase('entry');
            await new Promise(r => setTimeout(r, 500));

            // Scene 2: Walk left
            setPhase('walkLeft');
            setFacingRight(false);
            await animatePosition(280, 80, 3000);

            // Scene 3: Wave
            setPhase('wave');
            setFacingRight(true);
            setCurrentMessage(messages.wave);
            await new Promise(r => setTimeout(r, 400));
            setShowBubble(true);
            await new Promise(r => setTimeout(r, 2500));
            setShowBubble(false);
            await new Promise(r => setTimeout(r, 400));

            // Scene 4: Walk to center
            setPhase('walkCenter');
            setFacingRight(true);
            await animatePosition(80, 150, 1500);

            // Scene 5: Sunglasses
            setPhase('sunglassesOn');
            await new Promise(r => setTimeout(r, 500));
            setPhase('coolPose');
            setCurrentMessage(messages.cool);
            setShowBubble(true);
            await new Promise(r => setTimeout(r, 2500));
            setShowBubble(false);
            await new Promise(r => setTimeout(r, 500));

            // Scene 6: Walk right
            setPhase('walkRight');
            setFacingRight(true);
            await animatePosition(150, 200, 1200);

            // Scene 7: Jump!
            setPhase('jump');
            setCurrentMessage(messages.jump);
            setShowBubble(true);
            await new Promise(r => setTimeout(r, 600));
            setShowBubble(false);
            await new Promise(r => setTimeout(r, 400));

            // Scene 8: Thinking
            setPhase('thinking');
            setCurrentMessage(messages.thinking);
            setShowBubble(true);
            await new Promise(r => setTimeout(r, 2000));
            setShowBubble(false);
            await new Promise(r => setTimeout(r, 400));

            // Scene 9: Thumbs up
            setPhase('thumbsUp');
            setCurrentMessage(messages.thumbsUp);
            setShowBubble(true);
            await new Promise(r => setTimeout(r, 2000));
            setShowBubble(false);
            await new Promise(r => setTimeout(r, 400));

            // Scene 10: Peace
            setPhase('peaceSign');
            setCurrentMessage(messages.peace);
            setShowBubble(true);
            await new Promise(r => setTimeout(r, 2000));
            setShowBubble(false);
            await new Promise(r => setTimeout(r, 400));

            // Walk to rest
            setPhase('walkRight');
            setFacingRight(true);
            await animatePosition(200, 160, 1500);

            // Rest and idle
            setPhase('rest');
            await new Promise(r => setTimeout(r, 3000));
            setPhase('idle');
        };

        runSequence();
    }, []);

    // Idle animations
    useEffect(() => {
        if (phase !== 'idle' || isHovered) return;

        const idleScenes = [
            async () => {
                setPhase('wave');
                setCurrentMessage(messages.wave);
                await new Promise(r => setTimeout(r, 400));
                setShowBubble(true);
                await new Promise(r => setTimeout(r, 2000));
                setShowBubble(false);
                await new Promise(r => setTimeout(r, 300));
                setPhase('idle');
            },
            async () => {
                setPhase('coolPose');
                setCurrentMessage(messages.cool);
                setShowBubble(true);
                await new Promise(r => setTimeout(r, 2500));
                setShowBubble(false);
                await new Promise(r => setTimeout(r, 300));
                setPhase('idle');
            },
            async () => {
                setPhase('jump');
                setCurrentMessage(messages.jump);
                setShowBubble(true);
                await new Promise(r => setTimeout(r, 800));
                setShowBubble(false);
                await new Promise(r => setTimeout(r, 300));
                setPhase('idle');
            },
            async () => {
                setPhase('thumbsUp');
                setCurrentMessage(messages.thumbsUp);
                setShowBubble(true);
                await new Promise(r => setTimeout(r, 2000));
                setShowBubble(false);
                await new Promise(r => setTimeout(r, 300));
                setPhase('idle');
            },
            async () => {
                setPhase('peaceSign');
                setCurrentMessage(messages.peace);
                setShowBubble(true);
                await new Promise(r => setTimeout(r, 2000));
                setShowBubble(false);
                await new Promise(r => setTimeout(r, 300));
                setPhase('idle');
            },
        ];

        const timeout = setTimeout(() => {
            const sceneIndex = idleSceneIndex % idleScenes.length;
            idleScenes[sceneIndex]();
            setIdleSceneIndex(prev => prev + 1);
        }, 8000 + Math.random() * 4000);

        return () => clearTimeout(timeout);
    }, [phase, idleSceneIndex, isHovered]);

    return (
        <motion.div
            className="fixed z-40 bottom-0 right-0 cursor-pointer"
            style={{ width: '400px', height: '140px' }}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleChatToggle}
        >
            {/* Avatar walking directly on the page */}
            <motion.div
                className="absolute bottom-2"
                style={{ right: `${position}px` }}
                animate={{
                    y: isJumping ? -jumpOffset : (isIdle ? breathOffset : 0)
                }}
                transition={{ duration: isJumping ? 0.05 : 0.5, ease: 'easeInOut' }}
            >
                <SpeechBubble visible={showBubble} message={currentMessage} />
                <AvatarCharacter
                    isWalking={isWalking}
                    isWaving={isWaving}
                    facingRight={facingRight}
                    walkCycle={walkCycle}
                    hasSunglasses={hasSunglasses}
                    isCoolPose={isCoolPose}
                    isThinking={isThinking}
                    isThumbsUp={isThumbsUp}
                    isPeaceSign={isPeaceSign}
                    isJumping={isJumping}
                    isSurprised={isSurprised}
                    isHovered={isHovered}
                />
            </motion.div>

            {/* ChatBot */}
            <ChatBot isOpen={isChatOpen} onClose={handleChatClose} />
        </motion.div>
    );
}
