class Arrays {
  static getRandomSubarray(arr, size) {
    let shuffled = arr.slice(0), i = arr.length, temp, index;
    while (i--) {
      index = Math.floor((i + 1) * Math.random());
      temp = shuffled[index];
      shuffled[index] = shuffled[i];
      shuffled[i] = temp;
    }
  return shuffled.slice(0, size);
  }
  static sample(pool, k, destructive) {
    const n = pool.length;

    if (k < 0 || k > n)
      throw new RangeError("Sample larger than population or is negative");

    if (destructive || n <= (k <= 5 ? 21 : 21 + Math.pow(4, Math.ceil(Math.log(k*3) / Math.log(4))))) {
      if (!destructive)
        pool = Array.prototype.slice.call(pool);
      for (let i = 0; i < k; i++) { // invariant: non-selected at [i,n)
        const j = i + Math.random() * (n - i) | 0;
        const x = pool[i];
        pool[i] = pool[j];
        pool[j] = x;
      }
      pool.length = k; // truncate
      return pool;
    } else {
      const selected = new Set();
      while (selected.add(Math.random() * n | 0).size < k) {}
      return Array.prototype.map.call(selected, i => pool[i]);
    }
  }
}