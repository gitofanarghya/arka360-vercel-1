import { shallowMount } from '@vue/test-utils';
import SelectContainer from '../src/components/adderTable/components/ChildDropdown.vue';

describe('SelectContainer', () => {
  it('renders the component', () => {
    const wrapper = shallowMount(SelectContainer);
    expect(wrapper.exists()).toBe(true);
  });

  it('initializes with correct data properties', () => {
    const wrapper = shallowMount(SelectContainer);
    expect(wrapper.vm.selectedItem).toBeNull();
    expect(wrapper.vm.items).toEqual([]);
    expect(wrapper.vm.countryCode).toEqual({});
  });

  it('emits "selectedItem" event on addItem method when selectedItem is not null', () => {
    const wrapper = shallowMount(SelectContainer);
    wrapper.setData({ selectedItem: { name: 'Test Item' } });
    wrapper.vm.addItem();
    expect(wrapper.emitted('selectedItem')).toBeTruthy();
    expect(wrapper.emitted('selectedItem')[0]).toEqual([{ name: 'Test Item' }]);
    expect(wrapper.vm.selectedItem).toBeNull();
  });

  it('computes handleCurrencySymbol correctly based on countryCode', () => {
    const wrapper = shallowMount(SelectContainer);
    wrapper.setData({ countryCode: { currency_code: 'USD' } });
    expect(wrapper.vm.handleCurrencySymbol).toBe('$');
    wrapper.setData({ countryCode: {} });
    expect(wrapper.vm.handleCurrencySymbol).toBe('');
  });

  // You can write more test cases for other methods and functionalities as needed

  it('calls getAddersData method on mounted', async () => {
    const wrapper = shallowMount(SelectContainer);
    const getAddersDataMock = jest.spyOn(wrapper.vm, 'getAddersData');
    await wrapper.vm.$nextTick();
    expect(getAddersDataMock).toHaveBeenCalled();
  });
});