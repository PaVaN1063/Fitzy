import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

interface Section { h: string; p: string[]; }
interface Topic { title: string; sections: Section[]; }

const TOPICS: { [key: string]: Topic } = {
  help: {
    title: 'Help & FAQ',
    sections: [
      { h: 'How are my calories worked out?', p: ['Your resting burn (BMR) uses the Mifflin–St Jeor formula from your sex, age, height and weight. It is multiplied by your activity level to get maintenance calories, then adjusted for your goal: −20% to lose fat, +10% to build muscle.'] },
      { h: 'How much protein should I eat?', p: ['Most people who lift do well on 1.6–2.2 g per kg of body weight. Set your number with the slider in Body & goals; the default depends on your goal.'] },
      { h: 'Why does my water goal change?', p: ['It is 35 ml per kg of body weight, plus 500 ml on days you mark as a gym day on the Meals tab.'] },
      { h: 'A food is missing', p: ['Tap Add food, then Custom food. Enter the macros from the pack and it will be saved for next time.'] },
      { h: 'Why does my weight jump around?', p: ['Water, salt and food in your gut move scale weight by 0.5–1 kg day to day. Watch the 7-day average line on the Progress tab instead.'] },
      { h: 'Does the scanner work?', p: ['Not yet. Scanning is a demo that shows sample products so you can try the flow.'] },
    ],
  },
  privacy: {
    title: 'Privacy',
    sections: [
      { h: 'Your data stays on your phone', p: ['Meals, water, weigh-ins and your profile are stored only in this app on this phone. Nothing is uploaded, and there is no server.'] },
      { h: 'Sign-in', p: ['Login is a demo. Your email and password are checked for format only and are not sent anywhere. "Continue with Google" does not contact Google.'] },
      { h: 'Deleting your data', p: ['Profile › Delete all logs removes your meals, water and weigh-ins. Uninstalling the app removes everything.'] },
    ],
  },
  terms: {
    title: 'Terms of use',
    sections: [
      { h: 'Not medical advice', p: ['efacm gives general estimates for fitness tracking. It is not a substitute for advice from a doctor or registered dietitian, especially if you have a medical condition, are pregnant, or are under 18.'] },
      { h: 'Estimates', p: ['Food values are approximate for home-style portions and will differ from what you actually eat.'] },
      { h: 'Demo software', p: ['This is a free demo build provided as is, without warranty.'] },
    ],
  },
  about: {
    title: 'About efacm',
    sections: [
      { h: 'Eat. Train. Track.', p: ['efacm is a simple meal, protein and water tracker for people who lift, built around Indian home food.'] },
      { h: 'Built with', p: ['Ionic 6, Angular 15 and Capacitor 4.'] },
      { h: 'Version', p: ['1.0.0 (demo build)'] },
    ],
  },
};

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {
  topic: Topic = TOPICS['help'];
  isAbout = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const key = this.route.snapshot.paramMap.get('topic') ?? 'help';
    this.topic = TOPICS[key] ?? TOPICS['help'];
    this.isAbout = key === 'about';
  }
}
