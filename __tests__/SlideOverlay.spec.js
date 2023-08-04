import { shallowMount } from '@vue/test-utils';
import SlideDrawer from '../src/pages/AND/SlideDrawer.vue';

describe('SlideDrawer', () => {
  it('renders correctly when isOpen is true', () => {
    const wrapper = shallowMount(SlideDrawer, {
      propsData: {
        isOpen: true,
        width: '80%',
      },
      slots: {
        body: '<div>Content goes here</div>',
      },
    });

    expect(wrapper.find('.slide-drawer').classes()).toContain('slide-in');
    // expect(wrapper.find('.slide-drawer').element.style.width).toBe('80%');
    expect(wrapper.find('.slide-drawer').text()).toBe('Content goes here');
  });

  it('renders correctly when isOpen is false', () => {
    const wrapper = shallowMount(SlideDrawer, {
      propsData: {
        isOpen: false,
        width: '80%',
      },
      slots: {
        body: '<div>Content goes here</div>',
      },
    });

    expect(wrapper.find('.slide-drawer').classes()).not.toContain('slide-in');
    expect(wrapper.find('.slide-drawer').text()).toBe('Content goes here');
  });

  it('renders correctly when isClose is true', () => {
    const wrapper = shallowMount(SlideDrawer, {
      propsData: {
        isOpen: true,
        width: '80%',
        isClose: true,
      },
      slots: {
        body: '<div>Content goes here</div>',
      },
    });

    expect(wrapper.find('.slide-drawer').classes()).toContain('slide-out');
    // expect(wrapper.find('.slide-drawer').element.style.width).toBe('0');
    expect(wrapper.find('.slide-drawer').text()).toBe('Content goes here');
  });
});
