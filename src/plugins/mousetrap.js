import Mousetrap from 'mousetrap';
import Vue from 'vue'

Mousetrap.prototype.stopCallback = function stopCallback(event, element) {
    // if the element has the class "mousetrap" then no need to stop
    // TODO: Remove 'mousetrap' class from input elements
    // TODO: Enable below block so that default implementation is followed
    // if ((` ${element.className} `).indexOf(' mousetrap ') > -1) {
    //     return false;
    // }

    // Events originating from a shadow DOM are re-targetted and `e.target` is the shadow host,
    // not the initial event target in the shadow tree. Note that not all events cross the
    // shadow boundary.
    // For shadow trees with `mode: 'open'`, the initial event target is the first element in
    // the event’s composed path. For shadow trees with `mode: 'closed'`, the initial event
    // target cannot be obtained.
    if ('composedPath' in event && typeof event.composedPath === 'function') {
        // For open shadow trees, update `element` so that the following check works.
        const initialEventTarget = event.composedPath()[0];
        if (initialEventTarget !== event.target) {
            // eslint-disable-next-line no-param-reassign
            element = initialEventTarget;
        }
    }

    // stop for input, select, and textarea
    return (
        (element.tagName === 'INPUT' ||
            element.tagName === 'SELECT' ||
            element.tagName === 'TEXTAREA' ||
            element.isContentEditable) &&
        !['Enter', 'Escape'].includes(event.key)
    );
};
Object.defineProperty(Vue.prototype, '$mousetrap', { value: Mousetrap });
