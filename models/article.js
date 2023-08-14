export class Article {
  constructor({ authorIdx, title, content, createdAt }) {
    this._authorIdx = authorIdx;
    this._title = title;
    this._content = content;
    this._createdAt = createdAt;
  }

  get authorIdx() {
    return this._authorIdx;
  }
  set authorIdx(input) {
    if (typeof input !== 'number' || input < 0) {
      throw new Error('invalid author index');
    }

    this._authorIdx = input;
  }

  get title() {
    return this._title;
  }
  set title(input) {
    const regex = /[[ -~]{1,}]/;
    if (typeof input !== 'string' || !regex.test(input)) {
      throw new Error('invalid title');
    }

    this._title = input;
  }

  get content() {
    return this._content;
  }
  set content(input) {
    if (typeof input !== 'string' || input.length == 0) {
      throw new Error('invalid content');
    }

    this._content = input;
  }

  get createdAt() {
    return this._createdAt;
  }
}
