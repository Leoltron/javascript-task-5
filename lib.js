'use strict';

class ArrayIterator {
    constructor(array) {
        this._array = array;
        this._length = array.length;
        this._nextIndex = 0;
    }

    next() {
        return this.done() ? null : this._array[this._nextIndex++];
    }

    done() {
        return this._nextIndex === this._length;
    }
}

class Filter {

    check() {
        return true;
    }

    filterAll(array) {
        return array.filter(e => this.check(e));
    }
}

class GenderFilter extends Filter {
    constructor(gender) {
        super();
        this._gender = gender;
    }

    check(friend) {
        return friend.gender === this._gender;
    }
}

class MaleFilter extends GenderFilter {

    constructor() {
        super('male');
    }
}

class FemaleFilter extends GenderFilter {

    constructor() {
        super('female');
    }
}

function addAll(set, iterable) {
    for (const element of iterable) {
        set.add(element);
    }
}

class FriendPicker {
    constructor(friends) {
        this._friends = friends.slice()
            .sort((a, b) => a.name.localeCompare(b.name));
    }

    getFriends(depth) {
        const friends = this._friends.slice();
        const pickedFriends = [];
        let prevPickedFriendsLength = 0;
        let currentStepFriends = new Set(this._getBestFriends());
        for (let i = 0; i < depth && friends.length > 0; i++) {
            const removed = FriendPicker._removeFriendsWithNames(friends, currentStepFriends);

            currentStepFriends = new Set();
            for (const friend of removed) {
                pickedFriends.push(friend);
                addAll(currentStepFriends, friend.friends.filter(f => !pickedFriends.includes(f)));
            }

            if (prevPickedFriendsLength === pickedFriends.length) {
                break;
            }
            prevPickedFriendsLength = pickedFriends.length;
        }

        return pickedFriends;
    }

    static _removeFriendsWithNames(friends, names) {
        const removed = [];
        for (let j = 0; j < friends.length; j++) {
            const friend = friends[j];
            if (names.has(friend.name)) {
                friends.splice(j--, 1);
                removed.push(friend);
            }
        }

        return removed;
    }

    _getBestFriends() {
        return this._friends.filter(f => f.best)
            .map(f => f.name);
    }

}

class Iterator extends ArrayIterator {
    constructor(friends, filter, maxLevel = Number.MAX_SAFE_INTEGER) {
        if (!(filter instanceof Filter)) {
            throw new TypeError('Expected filter to be a Filter');
        }
        const pickedFriends = new FriendPicker(friends).getFriends(maxLevel);

        super(filter.filterAll(pickedFriends));
    }
}

class LimitedIterator extends Iterator {
    constructor(friends, filter, maxLevel) {
        super(friends, filter, maxLevel);
    }
}

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
