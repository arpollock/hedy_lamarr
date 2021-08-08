import 'phaser';
import {
  backgroundColor,
  sceneNames,
  width,
  height,
  textConfig,
  assetBaseURL,
  screenEdgePadding,
  assetTutorialUiURL,
  numTutorialScreens,
  TextObject,
  tutorialTextObjects, // todo use this
  TutorialTextBackgroundSizes,
  TutorialTextPositions,
} from '../Constants';

class FormattedText extends Phaser.GameObjects.Sprite {
  private text: Phaser.GameObjects.Text;

  constructor(scene, textObject: TextObject, defaultVisibility: boolean) {
    const textureStr: string = textObject.size === TutorialTextBackgroundSizes.small ? 'text_background_small' : 'text_background_large';
    super(scene, 0, 0, textureStr);
    let x: number = 0;
    let y: number = 0;
    const buttonYPadding: number = 45;
    const fromEdgeX: number = screenEdgePadding * 3 + this.displayWidth / 2;
    const fromEdgeY: number = screenEdgePadding * 3 + this.displayHeight / 2;
    switch( textObject.position ) {
      case TutorialTextPositions.top_right:
        x = width - fromEdgeX;
        y = fromEdgeY
        break;
      case TutorialTextPositions.top_center:
        x = width / 2;
        y = fromEdgeY
        break;
      case TutorialTextPositions.top_left:
        x = fromEdgeX;
        y = fromEdgeY + buttonYPadding;
        break;
      case TutorialTextPositions.middle_left:
        x = fromEdgeX;
        y = height / 2;
        break;
      case TutorialTextPositions.bottom_left:
        x = fromEdgeX;
        y = height - fromEdgeY - buttonYPadding;
        break;
      case TutorialTextPositions.bottom_center:
          x = width / 2;
          y = height - fromEdgeY - buttonYPadding;
          break;
      case TutorialTextPositions.bottom_right:
        x = width - fromEdgeX;
        y = height - fromEdgeY - buttonYPadding;
        break;
      case TutorialTextPositions.middle_right:
        x = width - fromEdgeX;
        y = height / 2;
        break;
      default:
        x = width - fromEdgeX;
        y = height - fromEdgeY;
        break;
    }
    this.setX(x);
    this.setY(y);
    this.setOrigin(0.5);
    
    this.text = scene.add.text(x, y, textObject.text, {
      fontSize: textConfig.tertiaryTitleFontSize,
      color: textConfig.secondaryFillColor,
      fontFamily: textConfig.fontFams,
      align: 'justify',
      wordWrap: {
        width: this.displayWidth - screenEdgePadding * 4,
      }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(1); // set origin makes it so we can center the text easily
    this.setVisible(defaultVisibility);
    scene.add.existing(this);
  }

  public setVisible(value: boolean){
    this.text.setVisible(value);
    return super.setVisible(value);

  }
}

export class TutorialScene extends Phaser.Scene {

  private mainMenuButton: Phaser.GameObjects.Sprite;
  private backgroundScreens: Phaser.GameObjects.Sprite[];
  private textObjects: Array<FormattedText[]>
  // private textByScreen: Array<Phaser.GameObjects.Text[]>;
  // private textBackgroundsByScreen: Array<Phaser.GameObjects.Sprite[]>;
  private currScreenIdx: number;
  private nextButton: Phaser.GameObjects.Sprite;
  private prevButton: Phaser.GameObjects.Sprite;

  constructor() {
    super({
      key: sceneNames.tutorial
    });
    this.mainMenuButton = null;
    this.nextButton = null;
    this.prevButton = null;
    this.textObjects = new Array(numTutorialScreens);
    // this.textByScreen = new Array(numTutorialScreens);
    // this.textBackgroundsByScreen = new Array(numTutorialScreens);
  }

  public init(params): void {
    
  }

  public preload(): void {
    this.load.setBaseURL(assetBaseURL);
    for (let i = 0; i < numTutorialScreens; i++) {
      this.load.image(`tutorial_background_${i}`, `${assetTutorialUiURL}background_${i}.png`);
    }
    this.load.image('text_background_large',  `${assetTutorialUiURL}text_background_large.png`);
    this.load.image('text_background_small',  `${assetTutorialUiURL}text_background_small.png`);
    this.load.image('arrow',  `${assetTutorialUiURL}arrow.png`);
    this.load.image('arrow_hover',  `${assetTutorialUiURL}arrow_hover.png`);
  }

  public create(): void {
    
    this.cameras.main.setBackgroundColor(backgroundColor);
    this.backgroundScreens = [];
    for (let i = 0; i < numTutorialScreens; i++) {
      const tempBgSprite: Phaser.GameObjects.Sprite = this.add.sprite(width / 2, height / 2, `tutorial_background_${i}`).setOrigin(0.5).setSize(width, height).setVisible(false);
      this.backgroundScreens.push(tempBgSprite);
    }
    this.currScreenIdx = 0; // always start @ beginning of tutorial
    this.backgroundScreens[this.currScreenIdx].setVisible(true); // show the first screen

    // buttons to navigate the tutorial screens
    // next (right)
    this.nextButton = this.add.sprite(width - screenEdgePadding, height - screenEdgePadding, 'arrow').setOrigin(1);
    this.nextButton.setInteractive({
      useHandCursor: true
    });
    this.nextButton.on('pointerover', this.onNextButtonHoverEnter, this);
    this.nextButton.on('pointerout', this.onNextButtonHoverExit, this);
    this.nextButton.on('pointerdown', this.nextScreen, this);
    if (this.currScreenIdx === numTutorialScreens - 1) {
      this.nextButton.setVisible(false);
    }
    // prev (left)
    this.prevButton = this.add.sprite(screenEdgePadding, height - screenEdgePadding, 'arrow').setOrigin(0, 1);
    this.prevButton.setInteractive({
      useHandCursor: true
    });
    this.prevButton.on('pointerover', this.onPrevButtonHoverEnter, this);
    this.prevButton.on('pointerout', this.onPrevButtonHoverExit, this);
    this.prevButton.on('pointerdown', this.prevScreen, this);
    this.prevButton.setFlipX(true);
    if (this.currScreenIdx === 0) {
      this.prevButton.setVisible(false);
    }
    // button to go back to the main menu
    this.mainMenuButton = this.add.sprite(screenEdgePadding, screenEdgePadding, 'main_menu_button').setOrigin(0);
    this.mainMenuButton.setInteractive({
      useHandCursor: true
    });
    this.mainMenuButton.on('pointerover', this.onMainMenuButtonHoverEnter, this);
    this.mainMenuButton.on('pointerout', this.onMainMenuButtonHoverExit, this);
    this.mainMenuButton.on('pointerdown', this.goToMainMenu, this);
    this.mainMenuButton.setScale(0.5);
    // text + backgrounds for each screen
    for (let i = 0; i < numTutorialScreens; i++) {
        this.textObjects[i] = [];
    }
    for (let i = 0; i < tutorialTextObjects.length; i++) {
      const textIdx: number = tutorialTextObjects[i].screen;
      const currText: FormattedText = new FormattedText(this, tutorialTextObjects[i], ( textIdx === this.currScreenIdx));
      this.textObjects[textIdx].push(currText);
    }
    // for (let i = 0; i < numTutorialScreens; i++) {
    //   this.textByScreen[i] = [];
    //   this.textBackgroundsByScreen[i] = [];
    //   const currX: number = width * 2 / 3;
    //   const currY: number = height / 3;
    //   const currBgSprite: Phaser.GameObjects.Sprite = this.add.sprite(currX, currY, 'text_background_large').setOrigin(0.5).setVisible(false);
    //   this.textBackgroundsByScreen[i].push(currBgSprite);
    //   const currStr: string = `Testing: ${i}`;
    //   const currText = this.add.text(currX, currY, currStr, {
    //     fontSize: textConfig.tertiaryTitleFontSize,
    //     color: textConfig.secondaryFillColor,
    //     fontFamily: textConfig.fontFams,
    //     wordWrap: { width: currBgSprite.displayWidth - screenEdgePadding / 2, },
    //   }).setOrigin(0.5).setVisible(false); 
    //   currText.setScrollFactor(0);
    //   this.textByScreen[i].push(currText);
    //   this.showCurrentScreenTextAndBackgrounds();
    // }
    
  }

  public update(time: number): void {
  
  }

  private hideCurrentScreenTextAndBackgrounds(): void {
    // for (let i = 0; i < this.textBackgroundsByScreen[this.currScreenIdx].length; i++) {
    //   this.textBackgroundsByScreen[this.currScreenIdx][i].setVisible(false);
    //   this.textByScreen[this.currScreenIdx][i].setVisible(false);
    // }
    for (let i = 0; i < this.textObjects[this.currScreenIdx].length; i++) {
      this.textObjects[this.currScreenIdx][i].setVisible(false);
      this.textObjects[this.currScreenIdx][i].setVisible(false);
    }
  }

  private showCurrentScreenTextAndBackgrounds(): void {
    for (let i = 0; i < this.textObjects[this.currScreenIdx].length; i++) {
      this.textObjects[this.currScreenIdx][i].setVisible(true);
      this.textObjects[this.currScreenIdx][i].setVisible(true);
    }
  }

  private onMainMenuButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { }

  private onMainMenuButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void { } 

  public goToMainMenu(): void {
    // go back to the main menu
    this.scene.launch(sceneNames.start);
    this.scene.stop(sceneNames.tutorial);
  }

  private onNextButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    this.nextButton.setTexture('arrow_hover');
  }

  private onNextButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    this.nextButton.setTexture('arrow');
  } 

  public nextScreen(): void {
    this.hideCurrentScreenTextAndBackgrounds();
    // go back to the main menu
    this.backgroundScreens[this.currScreenIdx].setVisible(false);
    this.currScreenIdx++;
    if (this.currScreenIdx >= numTutorialScreens) {
      this.currScreenIdx = numTutorialScreens - 1; // bc index 0
    }
    this.backgroundScreens[this.currScreenIdx].setVisible(true);
    if (this.currScreenIdx === numTutorialScreens - 1) {
      this.nextButton.setVisible(false);
    } else if (this.currScreenIdx > 0) {
      this.prevButton.setVisible(true);
    }
    this.showCurrentScreenTextAndBackgrounds();
  }

  private onPrevButtonHoverEnter(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    this.prevButton.setTexture('arrow_hover');
  }

  private onPrevButtonHoverExit(pointer: Phaser.Input.Pointer, localX: number, localY: number, event: Phaser.Types.Input.EventData): void {
    this.prevButton.setTexture('arrow');
  } 

  public prevScreen(): void {
    this.hideCurrentScreenTextAndBackgrounds();
    // go back to the main menu
    this.backgroundScreens[this.currScreenIdx].setVisible(false);
    this.currScreenIdx--;
    if (this.currScreenIdx < 0) {
      this.currScreenIdx = 0;
    }
    this.backgroundScreens[this.currScreenIdx].setVisible(true);
    if (this.currScreenIdx === 0) {
      this.prevButton.setVisible(false);
    } else if (this.currScreenIdx < numTutorialScreens - 1) {
      this.nextButton.setVisible(true);
    }
    this.showCurrentScreenTextAndBackgrounds();
  }

};