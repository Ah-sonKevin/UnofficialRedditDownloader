//todo standardize data send signel download / batch
export default class User {
  name: string;
  id: string;
  isGold: boolean;

  constructor(redditUser: { name: string; id: string; is_gold: boolean }) {
    this.name = redditUser.name;
    this.id = redditUser.id;
    this.isGold = redditUser.is_gold;
  }
}
