# Crisis-Tabletop
Open-source, AI-facilitated tabletop exercise (TXX) simulator. 
How it works: 
	1. Pick a disaster & severity level
	2. Describe the organization you want to exercise
	3. Claude plays the role of the controller -- generates situation updates, reacts to team decisions, and escalates or resvoves the scenario over a handful of rounds. 

## Why this Exists
Professional Explaination: Tabletop exercises are a standard, valuable part of disaster and incident-resposne prepardedness, but writing good ones takes a real facilitator expertise and prep time. This tool *doesn't* replace a trained facilitator -- it gives them a way to run a quick, decently realistic practice round of their own. It's a good rough draft and starting point for facilitators to use, refine, and use as their own. 
Actual Explaination: The idea came to me when I had a migraine. I thought it was pretty neat, and now we're here. 

## How it Works
1. Pick a disaster type (options are currently in `/scenarios/\*.yaml` -- currently only includes hurricane and ransomware) and a severity level. 
2. Complete the data-handling disclaimer and describe the organization being exercised.
3. Claude generates round 1: a situation update and a decision point. 
4. Once your team has made a decision on the course of action given the situation update, type it into the provided spot. 
5. Claude generates the consequences of that decision as well as the next round's situation update. 
	Possible updates: escalation, de-escalation -- depends on the scenario's rules and your team's response. 
6. This repeats for a fixed number of rounds (possibly user-defined, idrk yet). Ends with a resolution round.

**Read `docs/DISCLAIMER.md` BEFORE RUNNING THIS WITH ANYTHING OTHER THAN A FICTIONAL ORGANIZATION PROFILE**

# Setup
```bash
git clone <this repo> 
cd crisis-tabletop
npm install
cp .env.example .env
# edit .env and add your ANTHROPIC\_API\_KEY (https://console.anthropic.com/)
npm start
```

Open http://localhost:3000