export class Comment {
  constructor({ authorIdx, articleIdx, content, createdAt }) {
    this._authorIdx = authorIdx;
    this._articleIdx = articleIdx;
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

  get articleIdx() {
    return this._articleIdx;
  }
  set articleIdx(input) {
    if (typeof input !== 'number' || input < 0) {
      throw new Error('invalid article index');
    }

    this._articleIdx = input;
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
