import { shallowMount } from '@vue/test-utils';
import SummaryComponent from '../src/components/adderTable/components/TableSummary.vue';

describe('SummaryComponent', () => {
  it('displays the correct system cost', () => {
    const total = 1000;
    const wrapper = shallowMount(SummaryComponent, {
      propsData: {
        total,
        lineItems: [],
      },
    });

    const systemCostLine = wrapper.find('.summary-line:nth-child(1)');
    expect(systemCostLine.text()).toContain(`System cost ${total}`);
  });

  it('displays the correct adders cost', () => {
    const adders = 500;
    const wrapper = shallowMount(SummaryComponent, {
      propsData: {
        total: 0,
        lineItems: [{ type: 'adder', amount: 10, default_quantity: 50 }],
      },
    });

    const addersCostLine = wrapper.find('.summary-line:nth-child(2)');
    expect(addersCostLine.text()).toContain(`Total adders cost ${adders}`);
  });

  it('displays the correct discounts', () => {
    const discounts = 200;
    const wrapper = shallowMount(SummaryComponent, {
      propsData: {
        total: 0,
        lineItems: [{ type: 'discount', amount: 5, default_quantity: 40 }],
      },
    });

    const discountsLine = wrapper.find('.summary-line:nth-child(3)');
    expect(discountsLine.text()).toContain(`Total discounts -${discounts}`);
  });

  it('displays the correct grand total', () => {
    const total = 1000;
    const adders = 500;
    const discounts = 200;
    const grandTotal = total + adders - discounts;
    const wrapper = shallowMount(SummaryComponent, {
      propsData: {
        total,
        lineItems: [
          { type: 'adder', amount: 10, default_quantity: 50 },
          { type: 'discount', amount: 5, default_quantity: 40 },
        ],
      },
    });

    const grandTotalLine = wrapper.find('.summary-line:nth-child(4)');
    expect(grandTotalLine.text()).toContain(`Total System Cost ${grandTotal}`);
  });
  it('displays the correct system cost when total is zero', () => {
    const total = 0;
    const wrapper = shallowMount(SummaryComponent, {
      propsData: {
        total,
        lineItems: [],
      },
    });

    const systemCostLine = wrapper.find('.summary-line:nth-child(1)');
    expect(systemCostLine.text()).toContain(`System cost ${total}`);
  });

  it('displays the correct adders cost when there are no adders', () => {
    const adders = 0;
    const wrapper = shallowMount(SummaryComponent, {
      propsData: {
        total: 0,
        lineItems: [{ type: 'discount', amount: 5, default_quantity: 40 }],
      },
    });

    const addersCostLine = wrapper.find('.summary-line:nth-child(2)');
    expect(addersCostLine.text()).toContain(`Total adders cost ${adders}`);
  });

  it('displays the correct discounts when there are no discounts', () => {
    const discounts = 0;
    const wrapper = shallowMount(SummaryComponent, {
      propsData: {
        total: 0,
        lineItems: [{ type: 'adder', amount: 10, default_quantity: 50 }],
      },
    });

    const discountsLine = wrapper.find('.summary-line:nth-child(3)');
    expect(discountsLine.text()).toContain(`Total discounts -${discounts}`);
  });

  it('displays the correct grand total when there are no line items', () => {
    const grandTotal = 0;
    const wrapper = shallowMount(SummaryComponent, {
      propsData: {
        total: 0,
        lineItems: [],
      },
    });

    const grandTotalLine = wrapper.find('.summary-line:nth-child(4)');
    expect(grandTotalLine.text()).toContain(`Total System Cost${grandTotal}`);
  });

  it('displays the correct currency symbol', () => {
    const total = 1000;
    const countryCode = {
      currency_code: 'USD',
    };
    const wrapper = shallowMount(SummaryComponent, {
      propsData: {
        total,
        lineItems: [],
      },
      data() {
        return {
          countryCode,
        };
      },
    });

    const systemCostLine = wrapper.find('.summary-line:nth-child(1)');
    expect(systemCostLine.text()).toContain(`System cost $${total}`);
  });
  // Additional test cases can be written for edge cases and computed properties
});