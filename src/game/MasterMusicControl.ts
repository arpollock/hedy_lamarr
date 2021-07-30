import 'phaser';
import {
  assetBaseURL,
  sceneNames,
  musicKeyNames,
  screenEdgePadding
} from './../Constants';

export class MusicControlScene extends Phaser.Scene {

  private intro_music: Phaser.Sound.BaseSound;
  private toggleMusicButton: Phaser.GameObjects.Sprite;
  private music_on: boolean;

  constructor() {
    super({
      key: sceneNames.musicControl
    });
    this.intro_music = null;
    this.toggleMusicButton = null;
    this.music_on = false; // don't play music by default -> forces the click + satisfies web ettiquette
  }

  public init(params): void {
    
  }
  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    // load image assets
    this.load.image('music_turn_off', 'music_turnOff.png');
    this.load.image('music_turn_on', 'music_turnOn.png');
    // load audio assets
    const introTemp: Phaser.Types.Loader.FileTypes.AudioFileConfig = {
      key: musicKeyNames.intro,
      url: [ 'audio/foggy-forest.ogg', 'audio/foggy-forest.wav' ],
    };
    this.load.audio(introTemp);
    // load audio assets
    const audioCollectTemp: Phaser.Types.Loader.FileTypes.AudioFileConfig = {
      key: musicKeyNames.collectSFX,
      url: [ 'audio/shine_collect.ogg' ],
    };
    this.load.audio(audioCollectTemp);
    const obsUnlockTemp: Phaser.Types.Loader.FileTypes.AudioFileConfig = {
      key: musicKeyNames.obstacleUnlockSFX,
      url: [ 'audio/button_push.ogg' ],
    };
    this.load.audio(obsUnlockTemp);
    const winGameTemp: Phaser.Types.Loader.FileTypes.AudioFileConfig = {
      key: musicKeyNames.winGameSFX,
      url: [ 'audio/success.ogg' ],
    };
    this.load.audio(winGameTemp);
    // the next 2 audios are technically for ObstacleFixMenu.ts, but that's loaded later
    this.load.audio({
      key: musicKeyNames.dropAccept,
      url: [ 'audio/accept.ogg' ],
    });
    this.load.audio({
      key: musicKeyNames.dropReject,
      url: [ 'audio/reject.ogg' ],
    });
    // this.load.audio( musicKeyNames.intro, [ 'audio/foggy-forest.ogg', 'audio/foggy-forest.wav' ] );
  }

  public create(): void {
    this.cameras.main.setBackgroundColor(); // sets transparent
    // text to show the game title
    // actually play the music and connect it to the member var + button control
    this.intro_music = this.sound.add(musicKeyNames.intro, {
      mute: false,
      loop: true,
    }); // second param is Phaser.Types.Sound.SoundConfig
    this.toggleMusicButton = this.add.sprite(screenEdgePadding, screenEdgePadding,'music_turn_on').setOrigin(0);
    this.toggleMusicButton.setScale(0.5);
    this.toggleMusicButton.setInteractive({
      useHandCursor: true
    });
    this.toggleMusicButton.on('pointerover', this.onToggleMusicButtonHoverEnter, this);
    this.toggleMusicButton.on('pointerout', this.onToggleMusicButtonHoverExit, this);
    this.toggleMusicButton.on('pointerdown', this.toggleMusic, this);
  }

  public update(time: number): void {

  }

  private onToggleMusicButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onToggleMusicButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private toggleMusic(): void {
    if (this.music_on) {
      this.intro_music.pause();
      this.toggleMusicButton.setTexture('music_turn_on');
    } else { // the music is off
      this.intro_music.play(); // musicKeyNames.intro
      this.toggleMusicButton.setTexture('music_turn_off');
    }
    this.music_on = !(this.music_on);
  }

  public isMusicOn(): boolean {
    return this.music_on;
  }
};