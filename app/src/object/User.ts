export default class User {
  name: string;
  id: string;
  isGold: boolean;

  constructor(redditUser: any) {
    this.name = redditUser.name;
    this.id = redditUser.id;
    this.isGold = redditUser.is_gold;
  }
}
