import { shallowMount } from '@vue/test-utils';
import App from '../src/components/adderTable/index.vue';

describe('App', () => {
  it('renders the BillComponent', () => {
    const wrapper = shallowMount(App);

    expect(wrapper.findComponent({ name: 'BillComponent' }).exists()).toBe(true);
  });

  it('adds an additional cost item to the table', () => {
    const wrapper = shallowMount(App);

    wrapper.vm.addItemToTable('additionalCost');

    expect(wrapper.vm.tableData).toEqual([
      {
        name: 'Additional Cost',
        rateType: 'Fixed',
        amount: 100,
        quantity: 1,
        totalAmount: 100,
        editable: false,
      },
    ]);
  });

  it('adds a discount item to the table', () => {
    const wrapper = shallowMount(App);

    wrapper.vm.addItemToTable('discount');

    expect(wrapper.vm.tableData).toEqual([
      {
        name: 'Discount',
        rateType: 'Percentage',
        amount: 10,
        quantity: 1,
        totalAmount: -10,
        editable: true,
      },
    ]);
  });
});
