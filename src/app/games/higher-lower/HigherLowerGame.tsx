"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    getRandomPair,
    getRandomSong,
    formatViews,
    getThumbnailUrl,
    type SongData,
} from "@/lib/songs-data";
import { CONFIG } from "@/lib/config";
import Footer from "@/components/Footer";

type GamePhase = "playing" | "revealing" | "gameover";

export default function HigherLowerGame() {
    const [songA, setSongA] = useState<SongData | null>(null);
    const [songB, setSongB] = useState<SongData | null>(null);
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);
    const [phase, setPhase] = useState<GamePhase>("playing");
    const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
    const [chosen, setChosen] = useState<"a" | "b" | null>(null);
    const [showCta, setShowCta] = useState(false);
    const [countUpA, setCountUpA] = useState(0);
    const [countUpB, setCountUpB] = useState(0);
    const countRef = useRef<NodeJS.Timeout | null>(null);

    // Load high score & init game
    useEffect(() => {
        const saved = localStorage.getItem("hl-highscore");
        if (saved) setHighScore(parseInt(saved, 10));
        const [a, b] = getRandomPair();
        setSongA(a);
        setSongB(b);
    }, []);

    // Lock body scroll when game-over modal is open
    useEffect(() => {
        if (phase === "gameover") {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [phase]);

    const animateCountUp = useCallback(
        (targetA: number, targetB: number) => {
            const steps = 30;
            const duration = 1200;
            const interval = duration / steps;
            let step = 0;

            if (countRef.current) clearInterval(countRef.current);

            countRef.current = setInterval(() => {
                step++;
                const progress = step / steps;
                const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                setCountUpA(Math.floor(targetA * ease));
                setCountUpB(Math.floor(targetB * ease));

                if (step >= steps) {
                    setCountUpA(targetA);
                    setCountUpB(targetB);
                    if (countRef.current) clearInterval(countRef.current);
                }
            }, interval);
        },
        []
    );

    const handleChoice = useCallback(
        (choice: "a" | "b") => {
            if (phase !== "playing" || !songA || !songB) return;

            setChosen(choice);
            setPhase("revealing");

            const pickedSong = choice === "a" ? songA : songB;
            const otherSong = choice === "a" ? songB : songA;

            const isCorrect =
                pickedSong.views >= otherSong.views;

            setLastCorrect(isCorrect);
            animateCountUp(songA.views, songB.views);

            setTimeout(() => {
                if (isCorrect) {
                    const newScore = score + 1;
                    setScore(newScore);

                    // Show CTA every 5 rounds
                    if (newScore > 0 && newScore % 5 === 0) {
                        setShowCta(true);
                        setTimeout(() => setShowCta(false), 4000);
                    }

                    // Next round: winner stays, new challenger
                    setTimeout(() => {
                        const winner = pickedSong;
                        const newChallenger = getRandomSong(winner.videoId);
                        // Randomly place winner on left or right
                        if (Math.random() > 0.5) {
                            setSongA(winner);
                            setSongB(newChallenger);
                        } else {
                            setSongA(newChallenger);
                            setSongB(winner);
                        }
                        setPhase("playing");
                        setChosen(null);
                        setCountUpA(0);
                        setCountUpB(0);
                    }, 1800);
                } else {
                    // Game over
                    setTimeout(() => {
                        if (score > highScore) {
                            const newHigh = score;
                            setHighScore(newHigh);
                            localStorage.setItem("hl-highscore", newHigh.toString());
                        }
                        setPhase("gameover");
                    }, 1800);
                }
            }, 1400);
        },
        [phase, songA, songB, score, highScore, animateCountUp]
    );

    const restart = useCallback(() => {
        const [a, b] = getRandomPair();
        setSongA(a);
        setSongB(b);
        setScore(0);
        setPhase("playing");
        setChosen(null);
        setLastCorrect(null);
        setCountUpA(0);
        setCountUpB(0);
    }, []);

    const shareScore = useCallback(() => {
        const text = `🎵 I scored ${score} in Higher or Lower: Music Edition!\n\nCan you beat me? Play free → https://jukeboxduo.com/games/higher-lower`;
        if (navigator.share) {
            navigator.share({ text }).catch(() => {
                navigator.clipboard.writeText(text);
            });
        } else {
            navigator.clipboard.writeText(text);
        }
    }, [score]);

    if (!songA || !songB) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center relative">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-[#050505] to-[#050505] pointer-events-none" />
                <div className="w-12 h-12 border-4 border-white/10 border-t-red-500 rounded-full animate-spin z-10 shadow-[0_0_30px_rgba(239,68,68,0.5)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white overflow-hidden selection:bg-red-500/30 font-sans relative">
            {/* Animated Abstract Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-900/5 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-orange-900/5 blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
                {/* Subtle grain texture overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-50" />
            </div>

            {/* Navbar - Glassmorphic */}
            <nav
                className={`fixed ${CONFIG.MAINTENANCE_MODE ? "top-10" : "top-0"} left-0 w-full flex items-center justify-between px-6 py-4 z-50 backdrop-blur-xl bg-[#050505]/60 border-b border-white/[0.05] shadow-[0_4px_30px_rgba(0,0,0,0.3)]`}
            >
                <Link
                    href="/"
                    className="font-bold text-xl tracking-tight text-white hover:opacity-80 transition-opacity"
                >
                    Jukebox<span className="text-red-500">Duo</span>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)] text-sm">🏆</span>
                        <span className="text-sm font-bold tracking-wide text-gray-200">Best: {highScore}</span>
                    </div>
                    <div className="flex items-center gap-2 px-5 py-1.5 rounded-full bg-gradient-to-r from-red-600/20 to-orange-500/20 border border-red-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(239,68,68,0.2)]">
                        <span className="text-base font-black text-white">{score}</span>
                        <span className="text-xs font-bold text-red-300 uppercase tracking-widest">pts</span>
                    </div>
                </div>
            </nav>

            {/* CTA Toast - Premium Glass */}
            {showCta && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-500">
                    <Link
                        href="/signin"
                        className="flex items-center gap-3 px-6 py-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-xl rounded-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_32px_rgba(239,68,68,0.3)] hover:border-red-500/40 transition-all group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform duration-300">🎧</span>
                        <span className="text-sm font-bold text-white tracking-wide">
                            Listen with friends on Jukebox Duo
                        </span>
                        <svg className="w-4 h-4 text-gray-300 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            )}

            <main className="relative z-10 pt-20 pb-4 px-4 min-h-screen flex flex-col items-center justify-center">
                {/* Header */}
                <div className="text-center mb-4 md:mb-6 w-full animate-in fade-in slide-in-from-top-4 duration-700">
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tighter bg-gradient-to-br from-white via-gray-100 to-gray-400 bg-clip-text text-transparent drop-shadow-sm mb-2 md:mb-3 pb-2">
                        Higher or Lower Music-Edition
                    </h1>
                    <p className="text-sm md:text-lg text-gray-400 font-medium">
                        Which hit has more YouTube views?
                    </p>
                </div>

                {/* Game Over Overlay - Cinematic */}
                {phase === "gameover" && (
                    <div className="fixed inset-x-0 bottom-0 top-16 z-[60] flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-xl animate-in fade-in duration-500">
                        <div className="w-full max-w-md mx-4 my-auto py-8 flex items-center justify-center min-h-full">
                            <div className="bg-[#0a0a0a]/95 border border-white/10 rounded-[2rem] p-8 md:p-10 w-full text-center shadow-[0_0_100px_rgba(239,68,68,0.2)] animate-in zoom-in-95 duration-500 relative overflow-hidden">
                                {/* Subtle accent glow */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-gradient-to-b from-red-600/20 to-transparent blur-[50px] pointer-events-none" />

                                <div className="text-7xl mb-6 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] transform hover:scale-110 transition-transform duration-300">💥</div>
                                <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tighter drop-shadow-md">Game Over!</h2>
                                <p className="text-gray-400 mb-8 max-w-[280px] mx-auto text-sm md:text-base font-medium leading-relaxed">
                                    {score === 0
                                        ? "Ouch! Better luck next time."
                                        : score < 5
                                            ? `Not bad! You correctly guessed ${score} times.`
                                            : score < 10
                                                ? `Great job! ${score} correct answers is solid.`
                                                : `Incredible! A massive ${score} streak. Unstoppable!`}
                                </p>

                                <div className="flex items-center justify-center gap-10 mb-10 bg-white/[0.03] rounded-2xl p-6 border border-white/[0.05] shadow-inner">
                                    <div className="flex-1 flex flex-col items-center">
                                        <div className="text-5xl font-black tracking-tighter text-white drop-shadow-md">{score}</div>
                                        <div className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-3">
                                            Score
                                        </div>
                                    </div>
                                    <div className="w-px h-20 bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                                    <div className="flex-1 flex flex-col items-center">
                                        <div className="text-5xl font-black tracking-tighter text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]">
                                            {Math.max(score, highScore)}
                                        </div>
                                        <div className="text-[11px] text-gray-500 font-bold uppercase tracking-[0.3em] mt-3">
                                            Best
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 relative z-10 p-1">
                                    <button
                                        onClick={restart}
                                        className="w-full py-4 rounded-xl bg-white text-black font-black text-lg hover:bg-gray-200 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                                    >
                                        Play Again
                                    </button>
                                    <button
                                        onClick={shareScore}
                                        className="w-full py-4 rounded-xl bg-white/[0.05] border border-white/10 text-white font-bold text-base hover:bg-white/10 transition-all active:scale-[0.98]"
                                    >
                                        <span className="mr-2"></span> Share Score
                                    </button>
                                </div>

                                {/* Premium CTA to Jukebox Duo */}
                                <div className="mt-8 pt-6 border-t border-white/[0.05]">
                                    <p className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-[0.15em]">
                                        Level up your music
                                    </p>
                                    <Link
                                        href="/signin"
                                        className="flex items-center justify-center gap-3 w-full py-4 rounded-xl bg-gradient-to-r from-red-600/20 to-orange-500/20 border border-red-500/30 hover:border-red-500/60 hover:bg-red-500/10 text-sm font-black text-white transition-all group shadow-[0_0_20px_rgba(239,68,68,0.1)]"
                                    >
                                        <span className="text-lg">🎧</span>
                                        <span>Try Jukebox Duo Free</span>
                                        <svg className="w-4 h-4 text-red-400 group-hover:translate-x-1 group-hover:text-white transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Song Cards Layout - Dynamic height and aspect ratio */}
                <div className="flex-1 w-full max-w-5xl flex flex-col items-center justify-center px-2 md:px-0">
                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-14 relative">
                        {/* Song A */}
                        <SongCard
                            song={songA}
                            label="A"
                            phase={phase}
                            isChosen={chosen === "a"}
                            isCorrect={lastCorrect}
                            showViews={phase === "revealing" || phase === "gameover"}
                            displayViews={countUpA}
                            onClick={() => handleChoice("a")}
                            chosen={chosen}
                        />

                        {/* VS Divider - Dynamic Glowing Badge */}
                        <div className="flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none">
                            <div className="relative flex items-center justify-center w-16 h-16 md:w-24 md:h-24 rounded-full bg-black/90 backdrop-blur-xl border border-white/20 shadow-[0_0_40px_rgba(0,0,0,0.9)] overflow-hidden">
                                {/* Rotating gradient border effect */}
                                <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,transparent,rgba(255,255,255,0.4),transparent)] animate-[spin_4s_linear_infinite]" />
                                <div className="absolute inset-[3px] rounded-full bg-[#0a0a0a] flex items-center justify-center">
                                    <span className="text-xl md:text-3xl font-black bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent italic tracking-tighter drop-shadow-md pr-1 md:pr-1.5">
                                        VS
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Song B */}
                        <SongCard
                            song={songB}
                            label="B"
                            phase={phase}
                            isChosen={chosen === "b"}
                            isCorrect={lastCorrect}
                            showViews={phase === "revealing" || phase === "gameover"}
                            displayViews={countUpB}
                            onClick={() => handleChoice("b")}
                            chosen={chosen}
                        />
                    </div>
                </div>

                {/* Instruction hint - Subtle Pulse */}
                <div className="h-10 mt-8 md:mt-12 flex items-center justify-center">
                    {phase === "playing" && (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <p className="px-5 py-2.5 rounded-full bg-white/[0.05] border border-white/10 text-xs md:text-sm font-bold text-gray-300 tracking-wider uppercase animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.05)] backdrop-blur-md">
                                Select the track with more global views
                            </p>
                        </div>
                    )}
                </div>
            </main>

            {/* SEO Content Section */}
            <section className="relative z-10 py-24 px-4 bg-gradient-to-b from-transparent to-[#0a0a0a] border-t border-white/[0.02]">
                <div className="container mx-auto max-w-4xl prose prose-invert prose-headings:text-gray-100 prose-p:text-gray-400 prose-a:text-red-400 hover:prose-a:text-red-300">
                    <h2 className="text-3xl font-bold mb-6 tracking-tight">
                        How to Play Higher or Lower: Music Edition
                    </h2>
                    <p className="lead text-lg mb-6">
                        The rules are simple: you&apos;re shown two songs and you have to
                        guess which one has more views on YouTube. Get it right and you
                        score a point — get it wrong and it&apos;s game over. How far can
                        you go?
                    </p>
                    <p className="mb-10">
                        The game features over <strong>250 songs</strong> spanning pop,
                        hip-hop, K-pop, Bollywood, Latin, rock, EDM, and more. From
                        timeless classics to the latest chart-toppers, test your music
                        knowledge across every genre.
                    </p>

                    <div className="grid md:grid-cols-2 gap-6 my-12 not-prose">
                        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.05] transition-colors hover:bg-white/[0.05]">
                            <div className="text-4xl mb-4">🧠</div>
                            <h3 className="text-xl font-bold text-white mb-3">
                                Test Your Music Knowledge
                            </h3>
                            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                Think you know which songs are the most popular? Some results
                                will surprise you — viral nursery rhymes often beat the
                                biggest global pop stars.
                            </p>
                        </div>
                        <div className="p-8 rounded-3xl bg-white/[0.03] border border-white/[0.05] transition-colors hover:bg-white/[0.05]">
                            <div className="text-4xl mb-4">🏆</div>
                            <h3 className="text-xl font-bold text-white mb-3">
                                Challenge Your Friends
                            </h3>
                            <p className="text-gray-400 text-sm md:text-base leading-relaxed">
                                Share your high score and see who knows music best. Better
                                yet,{" "}
                                <Link
                                    href="/signin"
                                    className="text-red-400 hover:text-red-300 font-semibold"
                                >
                                    create a Jukebox Duo room
                                </Link>{" "}
                                and listen to the songs together!
                            </p>
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-6 tracking-tight mt-16">
                        Fun Facts About YouTube&apos;s Most Viewed Music Videos
                    </h2>
                    <ul className="space-y-4 text-gray-300">
                        <li className="flex items-start">
                            <span className="text-red-500 mr-3">■</span>
                            <span><strong>Baby Shark</strong> became the first video to hit 10 billion views — more than the world&apos;s population.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-500 mr-3">■</span>
                            <span><strong>Despacito</strong> was the fastest video to reach 5 billion views, taking just over 2 years.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-500 mr-3">■</span>
                            <span><strong>Gangnam Style</strong> was the first YouTube video to ever reach 1 billion views, back in 2012.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-red-500 mr-3">■</span>
                            <span>K-pop groups like <strong>BTS</strong> and <strong>BLACKPINK</strong> hold records for the most views in 24 hours for a music video premiere.</span>
                        </li>
                    </ul>

                    <h2 className="text-2xl font-bold mb-6 tracking-tight mt-16">
                        Discover More Music Experiences
                    </h2>
                    <p className="text-gray-300">
                        Love music? Check out{" "}
                        <Link href="/" className="text-red-400 hover:text-red-300 font-bold">
                            Jukebox Duo
                        </Link>{" "}
                        — a free platform where you can listen to music
                        in sync with friends. Whether you&apos;re into{" "}
                        <Link href="/listen-together/bts" className="text-red-400 hover:text-red-300 font-semibold">BTS</Link>,{" "}
                        <Link href="/listen-together/taylor-swift" className="text-red-400 hover:text-red-300 font-semibold">Taylor Swift</Link>, or{" "}
                        <Link href="/listen-together/bollywood-hits" className="text-red-400 hover:text-red-300 font-semibold">Bollywood hits</Link>, create a room and vibe together.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    );
}

// ─── Song Card Component ────────────────────────────────────────────

interface SongCardProps {
    song: SongData;
    label: string;
    phase: GamePhase;
    isChosen: boolean;
    isCorrect: boolean | null;
    showViews: boolean;
    displayViews: number;
    onClick: () => void;
    chosen: "a" | "b" | null;
}

function SongCard({
    song,
    phase,
    isChosen,
    isCorrect,
    showViews,
    displayViews,
    onClick,
    chosen,
}: SongCardProps) {
    const isClickable = phase === "playing";

    // Dynamic borders and glows for premium feel
    let borderClass = "border-white/10 hover:border-white/30";
    let glowClass = "shadow-[0_10px_40px_rgba(0,0,0,0.6)]";
    let containerBg = "bg-white/[0.02]";

    if (showViews && chosen !== null) {
        if (isChosen && isCorrect) {
            borderClass = "border-emerald-500/80";
            glowClass = "shadow-[0_0_80px_rgba(16,185,129,0.4)]";
            containerBg = "bg-emerald-900/10";
        } else if (isChosen && !isCorrect) {
            borderClass = "border-red-500/80";
            glowClass = "shadow-[0_0_80px_rgba(239,68,68,0.4)]";
            containerBg = "bg-red-900/10";
        } else {
            // Unchosen card fades back and darkens
            borderClass = "border-white/[0.02] opacity-40 grayscale-[50%]";
            glowClass = "shadow-none pointer-events-none";
        }
    }

    return (
        <button
            onClick={onClick}
            disabled={!isClickable}
            className={`
        relative group rounded-[2rem] md:rounded-[2.5rem] border transition-all duration-700 w-full aspect-video md:aspect-[16/10] lg:aspect-video flex flex-col justify-end overflow-hidden
        ${borderClass} ${glowClass} ${containerBg}
        ${isClickable ? "cursor-pointer hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(255,255,255,0.1)] active:scale-95" : "cursor-default"}
        ${isChosen && !isCorrect ? "animate-shake" : ""}
      `}
        >
            {/* Full Cover Background Image */}
            <div className="absolute inset-0 z-0 bg-[#111]">
                <Image
                    src={getThumbnailUrl(song.videoId)}
                    alt={`${song.title} by ${song.artist}`}
                    fill
                    className={`object-cover transition-transform duration-[1500ms] ease-out ${isClickable ? 'group-hover:scale-110' : ''}`}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    unoptimized
                    priority
                />
                {/* Advanced Gradients for depth and legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-100" />
                <div className={`absolute inset-0 bg-black/30 transition-colors duration-700 ${isClickable ? 'group-hover:bg-transparent' : ''}`} />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-end p-6 md:p-8 pb-10">

                {/* Number Reveal State */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 backdrop-blur-[8px] bg-black/50 p-6
                        ${showViews ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-105 translate-y-4 pointer-events-none'}`}>
                    <div className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.5)] mb-2 mt-4">
                        {formatViews(displayViews)}
                    </div>
                    <div className="text-sm md:text-base font-black tracking-[0.4em] text-white/80 uppercase">
                        Views
                    </div>

                    {/* Status Badge */}
                    {showViews && isChosen && (
                        <div className={`mt-8 inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full font-black uppercase tracking-[0.2em] text-sm shadow-2xl
                animate-in zoom-in slide-in-from-bottom-8 duration-700 delay-150
                ${isCorrect ? "bg-emerald-500 text-white shadow-emerald-500/50" : "bg-red-500 text-white shadow-red-500/50"}
             `}>
                            {isCorrect ? "✅ Correct" : "❌ Wrong"}
                        </div>
                    )}
                </div>

                {/* Pre-reveal Song Text */}
                <div className={`w-full text-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                ${showViews ? 'opacity-0 translate-y-8 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>

                    {song.year && (
                        <span className="inline-block mb-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-gray-300 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 shadow-lg">
                            Released {song.year}
                        </span>
                    )}

                    <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-1 md:mb-2 drop-shadow-xl line-clamp-1 md:line-clamp-2 px-2">
                        &ldquo;{song.title}&rdquo;
                    </h2>
                    <p className="text-sm md:text-lg font-medium text-gray-300 drop-shadow-lg flex items-center justify-center gap-1.5 md:gap-2">
                        {song.artist}
                        {/* Verified tick for style */}
                        <svg className="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-400 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.9 14.7L6 12.6l1.5-1.5 2.6 2.6 6.4-6.4 1.5 1.5-7.9 7.9z" />
                        </svg>
                    </p>

                    {/* Interactive Hover Action Button */}
                    {isClickable && (
                        <div className="mt-4 md:mt-6 mb-1 md:mb-2 flex justify-center opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 ease-out">
                            <span className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 bg-white hover:bg-gray-100 rounded-full text-xs md:text-sm font-black text-black tracking-wide uppercase shadow-[0_10px_30px_rgba(255,255,255,0.3)]">
                                Select
                                <svg className="w-3 h-3 md:w-4 md:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                </svg>
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}
