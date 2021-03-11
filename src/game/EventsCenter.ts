import 'phaser';

// used to share event between two active scenes (ex. the HUD menu and the game screen)
const eventsCenter = new Phaser.Events.EventEmitter()

export default eventsCenter