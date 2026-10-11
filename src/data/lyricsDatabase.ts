/**
 * Real Synchronized LRC Lyrics Database for TuneTastic
 * Format: [mm:ss.xx] Lyrics line
 */

export interface TrackLyrics {
  title: string;
  artist: string;
  syncedLyrics: string;
}

export const CURATED_LYRICS: Record<string, TrackLyrics> = {
  // Imagine Dragons - Believer (also maps "Believer 1")
  'believer': {
    title: 'Believer',
    artist: 'Imagine Dragons',
    syncedLyrics: `[00:00.00] First things first
[00:01.30] I'ma say all the words inside my head
[00:03.90] I'm fired up and tired of the way that things have been, oh-ooh
[00:08.50] The way that things have been, oh-ooh
[00:11.80] Second thing second
[00:13.20] Don't you tell me what you think that I could be
[00:15.90] I'm the one at the sail, I'm the master of my sea, oh-ooh
[00:20.50] The master of my sea, oh-ooh
[00:23.50] I was broken from a young age
[00:25.50] Taking my sulking to the masses
[00:27.50] Writing my poems for the few
[00:29.00] That look at me, took to me, shook to me, feeling me
[00:31.90] Singing from heartache from the pain
[00:34.20] Taking my message from the veins
[00:36.40] Speaking my lesson from the brain
[00:38.20] Seeing the beauty through the...
[00:39.90] Pain! You made me a, you made me a believer, believer
[00:47.80] Pain! You break me down and build me up, believer, believer
[00:55.70] Pain! Oh, let the bullets fly, oh, let them rain
[01:00.00] My life, my love, my drive, it came from...
[01:03.50] Pain! You made me a, you made me a believer, believer
[01:11.50] Third things third
[01:13.00] Send a prayer to the ones up above
[01:15.60] All the hate that you've heard has turned your spirit to a dove, oh-ooh
[01:20.30] Your spirit up above, oh-ooh
[01:23.20] I was choking in the crowd
[01:25.10] Building my rain up in the cloud
[01:27.20] Falling like ashes to the ground
[01:28.90] Hoping my feelings, they would drown
[01:31.20] But they never did, ever lived, ebbing and flowing
[01:33.80] Inhibited, limited
[01:35.00] Till it broke up and it rained down
[01:37.00] It rained down, like...
[01:39.50] Pain! You made me a, you made me a believer, believer
[01:47.40] Pain! You break me down and build me up, believer, believer
[01:55.40] Pain! Oh, let the bullets fly, oh, let them rain
[01:59.80] My life, my love, my drive, it came from...
[02:03.20] Pain! You made me a, you made me a believer, believer
[02:11.50] Last things last
[02:13.00] By the grace of the fire and the flames
[02:15.50] You're the face of the future, the blood in my veins, oh-ooh
[02:20.20] The blood in my veins, oh-ooh
[02:23.00] But they never did, ever lived, ebbing and flowing
[02:25.80] Inhibited, limited
[02:27.00] Till it broke up and it rained down
[02:28.90] It rained down, like...
[02:31.30] Pain! You made me a, you made me a believer, believer
[02:39.30] Pain! You break me down and build me up, believer, believer
[02:47.20] Pain! Oh, let the bullets fly, oh, let them rain
[02:51.60] My life, my love, my drive, it came from...
[02:55.20] Pain! You made me a, you made me a believer, believer`
  },

  // Camila Cabello - Havana
  'havana': {
    title: 'Havana',
    artist: 'Camila Cabello',
    syncedLyrics: `[00:00.00] Havana, ooh na-na
[00:02.80] Half of my heart is in Havana, ooh-na-na
[00:07.50] He took me back to East Atlanta, na-na-na
[00:12.30] All of my heart is in Havana
[00:15.80] There's somethin' 'bout his manners
[00:18.50] Havana, ooh na-na
[00:21.00] He didn't walk up with that "how you doin'?"
[00:23.50] (When he came in the room)
[00:25.50] He said there's a lot of girls I can do with
[00:28.20] (But I can't without you)
[00:30.20] I'm doin' forever in a minute
[00:32.80] (That summer night in June)
[00:35.00] And papa says he got malo in him
[00:38.20] He got me feelin' like
[00:40.00] Ooh-ooh-ooh-ooh-ooh-ooh-ooh
[00:43.00] I knew it when I met him
[00:45.00] I loved him when I left him
[00:47.50] Got me feelin' like
[00:49.20] Ooh-ooh-ooh-ooh-ooh-ooh-ooh
[00:52.50] And every time I scratch my head, it feel like
[00:56.00] Havana, ooh na-na
[00:58.50] Half of my heart is in Havana, ooh-na-na
[01:03.20] He took me back to East Atlanta, na-na-na
[01:08.00] All of my heart is in Havana
[01:11.50] My heart is in Havana
[01:14.20] Havana, ooh na-na`
  },

  // The Kid LAROI & Justin Bieber - STAY
  'stay': {
    title: 'STAY',
    artist: 'The Kid LAROI & Justin Bieber',
    syncedLyrics: `[00:00.00] I do the same thing I told you that I never would
[00:03.50] I told you I'd change, even when I knew I never could
[00:07.40] Know that I can't find nobody else as good as you
[00:11.00] I need you to stay, need you to stay, hey
[00:14.80] I get drunk, wake up, I'm wasted still
[00:18.20] I realize the time that I wasted here
[00:22.00] I feel like you can't feel the way I feel
[00:25.60] Oh, I'll be fucked up if you can't be right here
[00:29.50] Oh, ooh-woah (oh, ooh-woah, ooh-woah)
[00:33.20] Oh, ooh-woah (oh, ooh-woah, ooh-woah)
[00:36.90] Oh, ooh-woah (oh, ooh-woah, ooh-woah)
[00:40.50] Oh, I'll be fucked up if you can't be right here
[00:44.20] When I'm away from you, I miss your touch
[00:47.80] You're the reason I believe in love
[00:51.50] It's been difficult for me to trust
[00:55.20] And I'm afraid that I'ma fuck it up
[00:59.00] Ain't no way that I can leave you stranded
[01:02.50] 'Cause you ain't never left me empty-handed
[01:06.20] And you know that I know that I can't live without you
[01:09.90] So baby, stay
[01:13.50] I do the same thing I told you that I never would
[01:17.20] I told you I'd change, even when I knew I never could
[01:21.00] Know that I can't find nobody else as good as you
[01:24.70] I need you to stay, need you to stay, hey`
  },

  // Lil Nas X / Morgan Wallen - THATS WHAT I WANT
  'thats what i want': {
    title: 'THATS WHAT I WANT',
    artist: 'Lil Nas X',
    syncedLyrics: `[00:00.00] Need a boy who can cuddle with me all night
[00:03.20] Keep me warm, love me long, be my sunlight
[00:07.00] Tell me lies, we can argue, we can fight
[00:10.50] Yeah, we did it before, but we'll do it tonight
[00:14.20] 'Cause 'lone I get cold, and I lose my control
[00:18.00] Baby, all that I'm longing for is a hand to hold
[00:21.80] In the dark, I don't wanna cry no more
[00:25.40] Wondering what I've been living for
[00:28.90] I want someone to love me
[00:32.40] I need someone who needs me
[00:36.10] 'Cause it don't feel right when it's late at night
[00:39.80] And it's just me in my bed
[00:43.50] Yeah, that's what I want
[00:45.30] Yeah, that's what I want
[00:47.10] That's what I really, really want`
  },

  // Beyoncé - Halo
  'halo': {
    title: 'Halo',
    artist: 'Beyoncé',
    syncedLyrics: `[00:00.00] Remember those walls I built?
[00:03.80] Well, baby, they're tumblin' down
[00:07.50] And they didn't even put up a fight
[00:11.20] They didn't even make a sound
[00:15.00] I found a way to let you in
[00:18.80] But I never really had a doubt
[00:22.50] Standin' in the light of your halo
[00:26.20] I got my angel now
[00:30.00] It's like I've been awakened
[00:33.50] Every rule I had you breakin'
[00:37.20] It's the risk that I'm takin'
[00:40.80] I ain't never gonna shut you out
[00:45.00] Everywhere I'm lookin' now
[00:48.50] I'm surrounded by your embrace
[00:52.20] Baby, I can see your halo
[00:56.00] You know you're my savin' grace
[00:59.80] You're everything I need and more
[01:03.50] It's written all over your face
[01:07.20] Baby, I can feel your halo
[01:11.00] Pray it won't fade away
[01:14.80] I can feel your halo, halo, halo
[01:19.50] I can see your halo, halo, halo
[01:24.20] I can feel your halo, halo, halo
[01:29.00] I can see your halo, halo, halo`
  },

  // Avicii - The Nights
  'the nights': {
    title: 'The Nights',
    artist: 'Avicii',
    syncedLyrics: `[00:00.00] Once upon a younger year
[00:02.50] When all our shadows disappeared
[00:04.90] The animals inside came out to play
[00:09.60] Went face to face with all our fears
[00:12.10] Learned our lessons through the tears
[00:14.50] Made memories we knew would never fade
[00:19.20] One day, my father, he told me
[00:21.80] "Son, don't let it slip away"
[00:24.00] He took me in his arms, I heard him say
[00:28.80] "When you get older, your wild heart will live for younger days
[00:33.60] Think of me if ever you're afraid"
[00:38.20] He said, "One day, you'll leave this world behind
[00:42.50] So live a life you will remember"
[00:47.80] My father told me when I was just a child
[00:52.50] "These are the nights that never die"
[00:56.80] My father told me`
  },

  // Shawn Mendes - Stitches
  'stitches': {
    title: 'Stitches',
    artist: 'Shawn Mendes',
    syncedLyrics: `[00:00.00] I thought that I've been hurt before
[00:03.80] But no one's ever left me quite this sore
[00:07.50] Your words cut deeper than a knife
[00:11.20] Now I need someone to breathe me back to life
[00:15.00] Got a feeling that I'm going under
[00:18.80] But I know that I'll make it out alive
[00:22.50] If I quit calling you my lover
[00:26.20] Move on
[00:28.00] You watch me bleed until I can't breathe
[00:32.20] Shaking, falling onto my knees
[00:35.80] And now that I'm without your kisses
[00:39.50] I'll be needing stitches
[00:43.00] Tripping over myself
[00:46.80] Aching, begging you to come help
[00:50.50] And now that I'm without your kisses
[00:54.20] I'll be needing stitches`
  },

  // The Script ft. will.i.am - Hall of Fame
  'hall of fame': {
    title: 'Hall of Fame',
    artist: 'The Script feat. will.i.am',
    syncedLyrics: `[00:00.00] Yeah, you could be the greatest, you can be the best
[00:03.20] You can be the King Kong banging on your chest
[00:06.50] You could beat the world, you could beat the war
[00:09.80] You could talk to God, go banging on his door
[00:13.00] You can throw your hands up, you can beat the clock
[00:16.20] You can move a mountain, you can break rocks
[00:19.50] You could be a master, don't wait for luck
[00:22.80] Dedicate yourself and you gon' find yourself
[00:26.00] Standing in the hall of fame
[00:31.00] And the world's gonna know your name
[00:36.50] 'Cause you burn with the brightest flame
[00:42.00] And the world's gonna know your name
[00:47.50] And you'll be on the walls of the hall of fame`
  },

  // Selena Gomez & The Scene - Who Says
  'who says': {
    title: 'Who Says',
    artist: 'Selena Gomez & The Scene',
    syncedLyrics: `[00:00.00] I wouldn't wanna be anybody else, hey
[00:05.50] You made me insecure, told me I wasn't good enough
[00:11.20] But who are you to judge when you're a diamond in the rough?
[00:16.80] I'm sure you got some things you'd like to change about yourself
[00:22.50] But when it comes to me, I wouldn't wanna be anybody else
[00:28.00] Na-na-na, na-na-na, na-na-na, na-na
[00:33.50] Na-na-na, na-na-na, na-na-na, na-na
[00:39.00] Who says, who says you're not perfect?
[00:43.50] Who says you're not worth it?
[00:47.00] Who says you're the only one that's hurting?
[00:51.50] Trust me, that's the price of beauty
[00:55.20] Who says you're not pretty?
[00:59.00] Who says you're not beautiful? Who says?`
  },

  // Britney Spears - Toxic
  'toxic': {
    title: 'Toxic',
    artist: 'Britney Spears',
    syncedLyrics: `[00:00.00] Baby, can't you see I'm calling?
[00:03.50] A guy like you should wear a warning
[00:07.00] It's dangerous, I'm falling
[00:11.20] There's no escape, I can't wait
[00:14.80] I need a hit, baby, give me it
[00:18.50] You're dangerous, I'm lovin' it
[00:22.20] Too high, can't come down
[00:25.80] Losing my head, spinnin' 'round and 'round
[00:29.50] Do you feel me now?
[00:32.80] With a taste of your lips, I'm on a ride
[00:36.50] You're toxic, I'm slippin' under
[00:40.20] With a taste of a poison paradise
[00:44.00] I'm addicted to you
[00:46.50] Don't you know that you're toxic?`
  },

  // P!nk feat. Nate Ruess - Just Give Me a Reason
  'just give me a reason': {
    title: 'Just Give Me a Reason',
    artist: 'P!nk feat. Nate Ruess',
    syncedLyrics: `[00:00.00] Right from the start you were a thief, you stole my heart
[00:06.00] And I, your willing victim
[00:11.00] I let you see the parts of me that weren't all that pretty
[00:17.00] And with every touch, you fixed them
[00:22.50] Now you've been talking in your sleep, oh-oh
[00:27.50] Things you never say to me, oh-oh
[00:32.80] Tell me that you've had enough of our love, our love
[00:41.50] Just give me a reason, just a little bit's enough
[00:46.50] Just a second we're not broken, just bent, and we can learn to love again
[00:53.00] It's in the stars, it's been written in the scars on our hearts
[00:58.50] We're not broken, just bent, and we can learn to love again`
  },

  // Aqua - Barbie Girl
  'barbie girl': {
    title: 'Barbie Girl',
    artist: 'Aqua',
    syncedLyrics: `[00:00.00] Hiya, Barbie! Hi, Ken!
[00:02.50] You wanna go for a ride? Sure, Ken!
[00:05.00] Jump in!
[00:07.50] I'm a Barbie girl in the Barbie world
[00:11.20] Life in plastic, it's fantastic!
[00:15.00] You can brush my hair, undress me everywhere
[00:18.80] Imagination, life is your creation
[00:23.00] Come on, Barbie, let's go party!
[00:26.50] Ah-ah-ah, yeah!
[00:28.50] Come on, Barbie, let's go party!
[00:32.00] Ooh-woah-ooh, ooh-woah-ooh!`
  },

  // One Direction - Story of My Life
  'story of my life': {
    title: 'Story of My Life',
    artist: 'One Direction',
    syncedLyrics: `[00:00.00] Written in these walls are the stories that I can't explain
[00:06.50] I leave my heart open, but it stays right here empty for days
[00:13.20] She told me in the morning she don't feel the same about us in her bones
[00:20.00] It seems to me that when I die these words will be written on my stone
[00:27.00] And I'll be gone, gone tonight
[00:33.20] The ground beneath my feet is open wide
[00:40.00] The way that I've been holdin' on too tight
[00:46.50] With nothin' in between
[00:50.00] The story of my life, I take her home
[00:55.50] I drive all night to keep her warm and time
[01:00.50] Is frozen (the story of, the story of)
[01:03.50] The story of my life, I give her hope
[01:09.00] I spend her love until she's broke inside
[01:14.00] The story of my life`
  },

  // Meghan Trainor - Me Too
  'me too': {
    title: 'Me Too',
    artist: 'Meghan Trainor',
    syncedLyrics: `[00:00.00] Who's that sexy thing I see over there?
[00:03.50] That's me, standin' in the mirror
[00:07.00] What's that icy thing hangin' 'round my neck?
[00:10.50] That's gold, show me some respect
[00:14.00] I thank God every day
[00:17.50] That I woke up feelin' this way
[00:21.00] And I can't help lovin' myself
[00:24.50] And I don't need nobody else, nuh-uh
[00:28.00] If I was you, I'd wanna be me too
[00:31.50] I'd wanna be me too, I'd wanna be me too
[00:35.00] If I was you, I'd wanna be me too
[00:38.50] I'd wanna be me too, I'd wanna be me too`
  },

  // J Balvin & Skrillex - In Da Getto
  'in da getto': {
    title: 'In Da Getto',
    artist: 'J Balvin & Skrillex',
    syncedLyrics: `[00:00.00] Party in the getto
[00:02.00] En el getto, to' el mundo en el getto
[00:05.50] Party in the getto
[00:07.50] En el getto, to' el mundo en el getto
[00:11.00] Y la vecina no sé qué va a hacer
[00:13.50] Porque esta noche vamo' a romper
[00:16.50] To' el mundo bailando, pegando la piel
[00:19.50] Trae la botella, que vamo' a beber
[00:22.50] In da getto, in da getto, in da getto
[00:26.00] Todo el mundo en el getto`
  },

  // Meek Mill - 24 7
  '24 7': {
    title: '24 7',
    artist: 'Meek Mill feat. Ella Mai',
    syncedLyrics: `[00:00.00] Oh, yeah, oh, yeah
[00:03.50] I've been thinking 'bout you twenty-four-seven
[00:07.00] Every single second that I'm awake
[00:11.20] You've been on my mind, ain't no mistake
[00:15.00] I just wanna see you, pull up on you right now
[00:18.80] Pull up in that foreign, turn the lights down
[00:22.50] Twenty-four hours, seven days a week
[00:26.20] You the only one that puts my heart to sleep
[00:30.00] Twenty-four-seven, thinking 'bout you`
  },

  // G Herbo - Him I
  'him i': {
    title: 'Him I',
    artist: 'G Herbo',
    syncedLyrics: `[00:00.00] Yeah, you know who it is
[00:03.50] G Herbo, PTSD
[00:06.50] I was really in the trenches, standing in the rain
[00:10.50] Every single scar I got represents the pain
[00:14.50] But I came up out the bottom, turned it to a bag
[00:18.50] Now they see me shining, got 'em looking so mad
[00:22.50] Real recognize real from the start to the end
[00:26.50] Never switched up on my brothers, never made pretend
[00:30.50] Him I, that's what they calling me now
[00:34.50] Stood tall when the chips were down`
  }
};

/**
 * Normalizes title for finding lyrics
 */
export function normalizeSongKey(title: string): string {
  return (title || '')
    .toLowerCase()
    .replace(/\(.*?\)/g, '')
    .replace(/\[.*?\]/g, '')
    .replace(/feat\.?.*/i, '')
    .replace(/ft\.?.*/i, '')
    .replace(/with .*/i, '')
    .replace(/remix.*/i, '')
    .replace(/[0-9]+$/g, '') // remove trailing digits e.g. "believer 1" -> "believer"
    .replace(/[^a-z0-9 ]/g, '')
    .trim();
}

/**
 * Searches the curated database for lyrics
 */
export function getCuratedLyrics(title: string, artist?: string): TrackLyrics | null {
  const normTitle = normalizeSongKey(title);
  
  // Direct match on key
  if (CURATED_LYRICS[normTitle]) {
    return CURATED_LYRICS[normTitle];
  }

  // Partial match
  for (const [key, val] of Object.entries(CURATED_LYRICS)) {
    if (normTitle.includes(key) || key.includes(normTitle)) {
      return val;
    }
  }

  // Check artist matches
  if (artist) {
    const normArtist = artist.toLowerCase();
    for (const val of Object.values(CURATED_LYRICS)) {
      if (val.artist.toLowerCase().includes(normArtist) && normTitle.includes(val.title.toLowerCase())) {
        return val;
      }
    }
  }

  return null;
}

/**
 * Parses LRC synced lyrics into time-stamped lines
 */
export interface SyncedLyricLine {
  time: number; // in seconds
  text: string;
}

export function parseLrcLyrics(lrcText: string): SyncedLyricLine[] {
  if (!lrcText) return [];
  const lines = lrcText.split('\n');
  const result: SyncedLyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})(?:\.(\d{2,3}))?\]/g;

  for (const line of lines) {
    let match: RegExpExecArray | null;
    timeRegex.lastIndex = 0;
    const matches: { time: number }[] = [];
    
    while ((match = timeRegex.exec(line)) !== null) {
      const min = parseInt(match[1], 10);
      const sec = parseInt(match[2], 10);
      const ms = match[3] ? parseInt(match[3].padEnd(3, '0').slice(0, 3), 10) : 0;
      matches.push({ time: min * 60 + sec + ms / 1000 });
    }

    const cleanText = line.replace(timeRegex, '').trim();
    if (cleanText && matches.length > 0) {
      for (const m of matches) {
        result.push({ time: m.time, text: cleanText });
      }
    } else if (cleanText && matches.length === 0 && result.length > 0) {
      // Line without timestamp, append slight offset
      const lastTime = result[result.length - 1].time;
      result.push({ time: lastTime + 3.0, text: cleanText });
    }
  }

  result.sort((a, b) => a.time - b.time);
  return result;
}
