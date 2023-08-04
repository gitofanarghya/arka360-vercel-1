<template>
    <div id="pricing" style="overflow-x: hidden">
        <el-header class="navBar-container">
            <navBar :current-page="currentPage" />
        </el-header>
        <div class="pricing-container">
            <div class="pricing-container-wrapper">
                <div v-if="expiryDays < 0" class="expiry-block">
                    <div class="top">Your plan has expired!</div>
                    <div class="bottom">Hope you are enjoying The Solar Labs. Renew your plan to create & manage your projects</div>
                </div>
                <div class="card-container">
                    <div class="plan-card-wrapper">
                        <div :class="[expiryDays < 0 ? '' : '', 'plan-card']">
                            <div class="title-block">
                                <!-- <div class="top">current plan:</div> -->
                                <div class="bottom" style=""><span style="font-weight: bold">{{ nonActivePlans[0] ? nonActivePlans[0].Name : '' }}</span> {{ `(${nonActivePlans[0] ? nonActivePlans[0].number_of_seats : 0 } User)` }}</div>
                                <div v-if="nonActivePlans[0] ? nonActivePlans[0].Name.toLowerCase() === 'basic' : false" class="choice">Popular choice</div>
                            </div>
                            <div class="user-dropdown-block">
                                <div :class="isAdmin ? 'dropdown-menu dropdown-p' : 'dropdown-menu disabled dropdown-p'"
                                id="dropdown-menu1"
                                @click="handleDropdown(1)">
                                    <div class="dropdown-p" style="">{{ `${nonActivePlans[0] ? nonActivePlans[0].number_of_seats : 0} User` }}</div>
                                    <img name="dropdown"  src="../../assets/drop/group-44.png" alt="v" style="" />
                                </div>
                                <div class="dropdown-line">
                                    <div class="dropdown-list hide" id="dropdown-list1">
                                        <div class="list-item" @click="changePlansWithUser(1, nonActivePlans[0].Name, 0)">1 User</div>
                                        <div class="list-item" @click="changePlansWithUser(2, nonActivePlans[0].Name, 0)">2 User</div>
                                        <div class="list-item" @click="changePlansWithUser(3, nonActivePlans[0].Name, 0)">3 User</div>
                                        <div class="list-item" @click="changePlansWithUser(4, nonActivePlans[0].Name, 0)">4 User</div>
                                        <div class="list-item" @click="changePlansWithUser(5, nonActivePlans[0].Name, 0)">5 User</div>
                                        <div class="line"></div>
                                        <div class="contact-message">Contact our sales team if you want to go for more than 5 users plan</div>
                                        <div class="button" @click="handleModal('contact-sales-modalbox', {message: 'Add more than 5 users', index: 1})">Contact Sales</div>
                                    </div>
                                </div>
                            </div>
                            <div class="price-top">
                                <span style="font-size: 1.75rem">
                                {{ `₹${nonActivePlans[0] ? ((nonActivePlans[0].actual_price / (12 * nonActivePlans[0].number_of_seats)) % 1 === 0 ? (nonActivePlans[0].actual_price / (12 * nonActivePlans[0].number_of_seats)) : (nonActivePlans[0].actual_price / (12 * nonActivePlans[0].number_of_seats)).toFixed(2)).toLocaleString() : 0}`}}</span>/Month/User
                            </div>
                            <div class="price-bottom">Billed yearly</div>
                            <div v-if="false" class="active-plan-model">
                                <div class="plan-description-block">
                                    <div class="top">
                                        <div class="left">
                                            <div class="block">
                                                <div></div>
                                                <div></div>
                                            </div>
                                        </div>
                                        <div class="right">
                                            <div class="block"></div>
                                        </div>
                                    </div>
                                    <div class="bottom">
                                        <div class="left">
                                            <div class="block"></div>
                                        </div>
                                        <div class="right">
                                            <div class="block"></div>
                                        </div>
                                    </div>
                                </div>
                                <div v-if="false" class="add-ons-block">
                                    <div class="addon-title-block">
                                        <div class="left">Add-ons</div>
                                        <div class="right">Used</div>
                                    </div>
                                    <div class="addon-features-block">
                                        <div class="feature-block">
                                            <div class="left">
                                                <div class="bullet-point"></div>
                                                <div class="text">3D Model export for SketchUp and
        PVsyst</div>
                                            </div>
                                            <div class="right">2/5</div>
                                        </div>
                                        <div class="feature-block">
                                            <div class="left">
                                                <div class="bullet-point"></div>
                                                <div class="text">API Integration</div>
                                            </div>
                                            <div class="right">1/1</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="button-block">
                                    <div class="button" style="font-size: 1.125rem; font-weight: bold">Buy Add-ons</div>
                                </div>
                            </div>
                            <template v-if="nonActivePlans[0]">
                                <div v-if="nonActivePlans[0].Name.toLowerCase() === 'basic'" class="plan-features-block">
                                    <div v-for="(item, index) in basicFeatures" class="feature-block" :key="index">
                                        <div class="bullet-point"></div>
                                        <div class="text">{{ item }}</div>
                                    </div>
                                </div>
                                <div v-if="nonActivePlans[0].Name.toLowerCase() === 'lite'" class="plan-features-block">
                                    <div v-for="(item, index) in liteFeatures" class="feature-block" :key="index">
                                        <div class="bullet-point"></div>
                                        <div class="text">{{ item }}</div>
                                    </div>
                                </div>
                                <div class="button-block">
                                    <template v-if="true">
                                        <div v-if="expiryDays > 0 && pricingPlansDetails.plan_id !== 3 && (nonActivePlans[0].Name.toLowerCase() === 'basic')" class="button" style="font-size: 1.125rem; font-weight: bold" @click="handleOrderSummary(nonActivePlans[0], {isSwitch: true})">Switch to Basic</div>
                                        <div v-else-if="expiryDays < 0 || pricingPlansDetails.plan_id === 3" :class="pricingPlansDetails.plan_id === 3 ? 'button disabled' : 'button'" style="background-image: linear-gradient(to bottom, #409EFF, #3092F7); border: none; font-weight: bold; color: #ffffff;" @click="handleOrderSummary(nonActivePlans[0])">Buy Now</div>
                                    </template>
                                </div>
                                <div v-if="pricingPlansDetails.plan_id === 3" class="book-demo-button" @click="handleModal('book-demo-modalbox')">Book a Demo</div>
                            </template>
                        </div>
                    </div>
                    <template>
                        <div v-if="!isActivePlan" class="plan-card-wrapper">
                            <div :class="[expiryDays < 0 ? '' : '', 'plan-card']">
                                <div class="title-block">
                                    <!-- <div class="top">current plan:</div> -->
                                    <div class="bottom" style=""><span style="font-weight: bold">{{ nonActivePlans[1] ? nonActivePlans[1].Name : '' }}</span> {{ `(${nonActivePlans[1] ? nonActivePlans[1].number_of_seats : 0} User)` }}</div>
                                    <div v-if="nonActivePlans[1] ? nonActivePlans[1].Name.toLowerCase() === 'basic' : false" class="choice">Popular Choice</div>
                                </div>
                                <div class="user-dropdown-block">
                                    <div :class="isAdmin ? 'dropdown-menu dropdown-p' : 'dropdown-menu disabled dropdown-p'"
                                    id="dropdown-menu2"
                                    @click="handleDropdown(2)">
                                        <div class="dropdown-p" style="">{{ `${nonActivePlans[1] ? nonActivePlans[1].number_of_seats : 0} User` }}</div>
                                        <img name="dropdown" src="../../assets/drop/group-44.png" alt="v" style="" />
                                    </div>
                                    <div class="dropdown-line">
                                        <div class="dropdown-list hide" id="dropdown-list2">
                                            <div class="list-item" @click="changePlansWithUser(1, nonActivePlans[1].Name, 1)">1 User</div>
                                            <div class="list-item" @click="changePlansWithUser(2, nonActivePlans[1].Name, 1)">2 User</div>
                                            <div class="list-item" @click="changePlansWithUser(3, nonActivePlans[1].Name, 1)">3 User</div>
                                            <div class="list-item" @click="changePlansWithUser(4, nonActivePlans[1].Name, 1)">4 User</div>
                                            <div class="list-item" @click="changePlansWithUser(5, nonActivePlans[1].Name, 1)">5 User</div>
                                            <div class="line"></div>
                                            <div class="contact-message">Contact our sales team if you want to go for more than 5 users plan</div>
                                            <div class="button" @click="handleModal('contact-sales-modalbox', {message: 'add more than 5 users'})">Contact Sales</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="price-top"><span style="font-size: 1.75rem">
                                    {{ `₹${nonActivePlans[1] 
                                    ? ((nonActivePlans[1].actual_price / (12 * nonActivePlans[1].number_of_seats)) % 1 === 0 ? (nonActivePlans[1].actual_price / (12 * nonActivePlans[1].number_of_seats)) : (nonActivePlans[1].actual_price / (12 * nonActivePlans[1].number_of_seats)).toFixed(2)).toLocaleString() 
                                    : 0}`}}
                                    </span>/Month/User</div>
                                <div class="price-bottom">Billed yearly</div>
                                <div v-if="false" class="active-plan-model">
                                    <div class="plan-description-block">
                                        <div class="top">
                                            <div class="left">
                                                <div class="block">
                                                    <div></div>
                                                    <div></div>
                                                </div>
                                            </div>
                                            <div class="right">
                                                <div class="block"></div>
                                            </div>
                                        </div>
                                        <div class="bottom">
                                            <div class="left">
                                                <div class="block"></div>
                                            </div>
                                            <div class="right">
                                                <div class="block"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="add-ons-block">
                                        <div class="addon-title-block">
                                            <div class="left">Add-ons</div>
                                            <div class="right">Used</div>
                                        </div>
                                        <div class="addon-features-block">
                                            <div class="feature-block">
                                                <div class="left">
                                                    <div class="bullet-point"></div>
                                                    <div class="text">3D Model export for SketchUp and
            PVsyst</div>
                                                </div>
                                                <div class="right">2/5</div>
                                            </div>
                                            <div class="feature-block">
                                                <div class="left">
                                                    <div class="bullet-point"></div>
                                                    <div class="text">API Integration</div>
                                                </div>
                                                <div class="right">1/1</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="button-block">
                                        <div class="button" style="font-size: 1.125rem; font-weight: bold">Buy More Add-ons</div>
                                    </div>
                                </div>
                                <template v-if="nonActivePlans[1]">
                                    <div v-if="nonActivePlans[1].Name.toLowerCase() === 'basic'" class="plan-features-block">
                                        <div v-for="(item, index) in basicFeatures" class="feature-block" :key="index">
                                            <div class="bullet-point"></div>
                                            <div class="text">{{ item }}</div>
                                        </div>
                                    </div>
                                    <div v-if="nonActivePlans[1].Name.toLowerCase() === 'lite'" class="plan-features-block">
                                        <div v-for="(item, index) in liteFeatures" class="feature-block" :key="index">
                                            <div class="bullet-point"></div>
                                            <div class="text">{{ item }}</div>
                                        </div>
                                    </div>
                                </template>
                                <div class="button-block">
                                    <div v-if="isAdmin || pricingPlansDetails.plan_id === 3" :class="pricingPlansDetails.plan_id === 3 ? 'button disabled' : 'button'" style="background-image: linear-gradient(to bottom, #409EFF, #3092F7); border: none; font-weight: bold; color: #ffffff;" @click="handleOrderSummary(nonActivePlans[1])">Buy Now</div>
                                </div>
                                <div v-if="pricingPlansDetails.plan_id === 3" class="book-demo-button" @click="handleModal('book-demo-modalbox')">Book a Demo</div>
                            </div>
                        </div>
                        <div v-if="isActivePlan" class="plan-card-wrapper">
                            <div :class="[expiryDays < 0 ? '' : '', 'plan-card active']" style="background-color: #1c3366">
                                <div v-if="isAdmin || expiryDays < 0" class="three-dots-icon dropdown-p" @click="handleCancelSubscription">
                                    <img name="dropdown" src="../../assets/drop/group-1471.png" alt=":" />
                                    <div class="cancel-subscription hide dropdown-p" id="cancel-subscription" @click="handleModal('cancel-subscription-modalbox')">Cancel Subscription</div>
                                </div>
                                <div class="title-block active" style="color: #ffffff">
                                    <div class="top" style="font-size: 1.5rem">Current Plan:</div>
                                    <div class="bottom" style=""><span style="font-weight: bold">{{ this.activePlan ? this.activePlan.Name : 0 }}</span> {{ `(${this.activePlan ? this.activePlan.number_of_seats : 0} User)` }}</div>
                                </div>
                                <div class="user-dropdown-block active">
                                    <div :class="isAdmin ? 'dropdown-menu active dropdown-p' : 'dropdown-menu active disabled dropdown-p'"
                                    id="dropdown-menu2"
                                    @click="handleDropdown(2)">
                                        <div class="dropdown-p" style="">{{ activeDropdownValue }}</div>
                                        <img name="dropdown" src="../../assets/drop/group-45.png" alt="v" style="" />
                                    </div>
                                    <div class="dropdown-line">
                                        <div class="dropdown-list hide" id="dropdown-list2">
                                            <div class="list-item" @click="changePlansWithUser(1, activePlan.Name, 'active')">1 User</div>
                                            <div class="list-item" @click="changePlansWithUser(2, activePlan.Name, 'active')">2 User</div>
                                            <div class="list-item" @click="changePlansWithUser(3, activePlan.Name, 'active')">3 User</div>
                                            <div class="list-item" @click="changePlansWithUser(4, activePlan.Name, 'active')">4 User</div>
                                            <div class="list-item" @click="changePlansWithUser(5, activePlan.Name, 'active')">5 User</div>
                                            <div class="line"></div>
                                            <div class="contact-message">Contact our sales team if you want to go for more than 5 users plan</div>
                                            <div class="button" @click="handleModal('contact-sales-modalbox', {message: 'Add more than 5 users', index: 2})">Contact Sales</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="price-top active"><span style="font-size: 1.75rem">{{ `₹${((activePlanPrice / 12) % 1 === 0 ? (activePlanPrice / 12) : (activePlanPrice / 12).toFixed(2)).toLocaleString()}`}}</span>/Month/User</div>
                                <div class="price-bottom active">Billed yearly</div>
                                <div v-if="true" class="active-plan-model">
                                    <div class="plan-description-block">
                                        <div class="block-up">
                                            <div class="block-tl">
                                                <div class="data">
                                                    <div class="up">Start Date:</div>
                                                    <div class="down">{{ convertDateFormat(this.pricingPlansDetails.start_date) }}</div>
                                                </div>
                                            </div>
                                            <div class="block-tr">
                                                <div class="data">
                                                    <div class="up">Expiry Date:</div>
                                                    <div class="down">{{ convertDateFormat(this.pricingPlansDetails.end_date) }}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="block-down">
                                            <div class="block-bl">
                                                <div class="data">
                                                    <div class="up">Residential
                Projects Created</div>
                                                    <div class="down">{{ pricingPlansDetails.small_used + pricingPlansDetails.medium_used }}</div>
                                                </div>
                                            </div>
                                            <div class="block-br">
                                                <div class="data">
                                                    <div class="up">Commercial
                Projects Created</div>
                                                    <div class="down">{{ pricingPlansDetails.large_used }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="add-ons-block" style="color: #ffffff">
                                        <div class="addon-title-block">
                                            <div class="left">Add-ons</div>
                                            <div class="right">Used</div>
                                        </div>
                                        <div v-if="false" class="addon-features-block">
                                            <div class="feature-block">
                                                <div class="bullet-point"></div>
                                                <div class="text">3D Model export for SketchUp and PVsyst</div>
                                                <div class="used">2/5</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="expiryDays > 30 && activeDropdownValue !== 'Add More Users'" class="button active" style="background-image: linear-gradient(to bottom, #409EFF, #3092F7); border: none; font-weight: bold" @click="handleOrderSummary(activePlan, {addUser: true})">Add Users</div>
                                    <div v-else-if="isAdmin && expiryDays < 31" class="button" style="margin: 0; background-image: linear-gradient(to bottom, #409EFF, #3092F7); border: none; font-weight: bold; color: #ffffff;" @click="handleOrderSummary(activePlan, {renew: true})">Renew Plan</div>
                                    <div v-else class="button active" style="font-size: 1.125rem; font-weight: bold" @click="handleModal('contact-sales-modalbox', {message: 'Buy add-ons'})">Buy Add-ons</div>
                                </div>
                                <div v-if="false" class="plan-features-block">
                                    <div class="feature-block">
                                        <div class="bullet-point"></div>
                                        <div class="text">300 Residential Designs Projects</div>
                                    </div>
                                    <div class="feature-block">
                                        <div class="bullet-point"></div>
                                        <div class="text">300 Residential Designs Projects</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                    <div class="plan-card-wrapper">
                        <div :class="[expiryDays < 0 ? '' : '', 'plan-card']">
                            <div class="title-block">
                                <!-- <div class="top">current plan:</div> -->
                                <!-- <div class="bottom" style=""><span style="font-weight: bold">{{ this.nonActivePlans[1] ? this.nonActivePlans[1].Name : '' }}</span> {{ `(${this.nonActivePlans[1] ? this.nonActivePlans[1].number_of_seats : 0} User)` }}</div> -->
                                <div class="bottom" style=""><span style="font-weight: bold">Enterprise</span>{{ ` (${enterprisePlans[0] ? enterprisePlans[0].number_of_seats : 0 } User)` }}</div>
                            </div>
                            <div class="user-dropdown-block">
                                <div :class="isAdmin ? 'dropdown-menu dropdown-p' : 'dropdown-menu disabled dropdown-p'"
                                id="dropdown-menu3"
                                @click="handleDropdown(3)">
                                    <div class="dropdown-p" style="">{{ `${enterprisePlans[0] ? enterprisePlans[0].number_of_seats : 0} User` }}</div>
                                    <img name="dropdown" src="../../assets/drop/group-44.png" alt="v" style="" />
                                </div>
                                <div class="dropdown-line">
                                    <div class="dropdown-list hide" id="dropdown-list3">
                                        <div class="list-item" @click="changePlansWithUser(1, enterprisePlans[0] ? enterprisePlans[0].Name : '', 0,true)">1 User</div>
                                        <div class="list-item" @click="changePlansWithUser(2, enterprisePlans[0] ? enterprisePlans[0].Name : '', 0, true)">2 User</div>
                                        <div class="list-item" @click="changePlansWithUser(3, enterprisePlans[0] ? enterprisePlans[0].Name : '', 0, true)">3 User</div>
                                        <div class="list-item" @click="changePlansWithUser(4, enterprisePlans[0] ? enterprisePlans[0].Name : '', 0, true)">4 User</div>
                                        <div class="list-item" @click="changePlansWithUser(5, enterprisePlans[0] ? enterprisePlans[0].Name : '', 0, true)">5 User</div>
                                        <div class="line"></div>
                                        <div class="contact-message">Contact our sales team if you want to go for more than 5 users plan</div>
                                        <div class="button" @click="handleModal('contact-sales-modalbox', {message: 'Add more than 5 users', index: 1})">Contact Sales</div>
                                    </div>
                                </div>
                            </div>
                            <div class="price-top">
                                <span style="font-size: 1.75rem">
                                {{ `₹${enterprisePlans[0] ? ((enterprisePlans[0].actual_price / (12 * enterprisePlans[0].number_of_seats)) % 1 === 0 ? (enterprisePlans[0].actual_price / (12 * enterprisePlans[0].number_of_seats)) : (enterprisePlans[0].actual_price / (12 * enterprisePlans[0].number_of_seats)).toFixed(2)).toLocaleString() : 0}`}}</span>/Month/User
                            </div>
                            <div class="price-bottom">Billed yearly</div>
                            <div v-if="false" class="active-plan-model">
                                <div class="plan-description-block">
                                    <div class="top">
                                        <div class="left">
                                            <div class="block">
                                                <div></div>
                                                <div></div>
                                            </div>
                                        </div>
                                        <div class="right">
                                            <div class="block"></div>
                                        </div>
                                    </div>
                                    <div class="bottom">
                                        <div class="left">
                                            <div class="block"></div>
                                        </div>
                                        <div class="right">
                                            <div class="block"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="add-ons-block">
                                    <div class="addon-title-block">
                                        <div class="left">Add-ons</div>
                                        <div class="right">Used</div>
                                    </div>
                                    <div class="addon-features-block">
                                        <div class="feature-block">
                                            <div class="left">
                                                <div class="bullet-point"></div>
                                                <div class="text">3D Model export for SketchUp and
        PVsyst</div>
                                            </div>
                                            <div class="right">2/5</div>
                                        </div>
                                        <div class="feature-block">
                                            <div class="left">
                                                <div class="bullet-point"></div>
                                                <div class="text">API Integration</div>
                                            </div>
                                            <div class="right">1/1</div>
                                        </div>
                                        <div class="feature-block">
                                            <div class="left">
                                                <div class="bullet-point"></div>
                                                <div class="text">Detailed Design Lite (Sites up to
        200 Kw)</div>
                                            </div>
                                            <div class="right">3/3</div>
                                        </div>
                                    </div>
                                </div>
                                <div class="button-block">
                                    <div class="button" style="font-size: 1.125rem; font-weight: bold">Buy More Add-ons</div>
                                </div>
                            </div>
                            <div class="plan-features-block">
                                <div class="feature-block">
                                    <div class="bullet-point"></div>
                                    <div class="text">Unlimited Residential Designs Projects</div>
                                </div>
                                <div class="feature-block">
                                    <div class="bullet-point"></div>
                                    <div class="text">Unlimited Commercial Design Projects 200 kW</div>
                                </div>
                                <div class="feature-block">
                                    <div class="bullet-point"></div>
                                    <div class="text">Unlimited Commercial Design Projects > 200 kW</div>
                                </div>
                                <div class="feature-block">
                                    <div class="bullet-point"></div>
                                    <div class="text">3D Model export for SketchUp and PVsyst</div>
                                </div>
                                <div class="feature-block">
                                    <div class="bullet-point"></div>
                                    <div class="text">API Integration</div>
                                </div>
                                <div class="feature-block">
                                    <div class="bullet-point"></div>
                                    <div class="text">Detailed Designing</div>
                                </div>
                            </div>
                            <template v-if="true">
                                <div v-if="expiryDays > 0 && pricingPlansDetails.plan_id !== 3 " class="button" style="font-size: 1.25rem; font-weight: bold;" @click="handleModal('contact-sales-modalbox', {message: 'Switch to enterprise'})">Switch to Enterprise</div>
                                <div v-else :class="pricingPlansDetails.plan_id === 3 ? 'button disabled' : 'button'" style="background-image: linear-gradient(to bottom, #409EFF, #3092F7); border: none; font-weight: bold; color: #ffffff;" @click="handleModal('contact-sales-modalbox', {message: 'Switch to enterprise'})">Buy Now</div>
                            </template>
                            <div v-if="pricingPlansDetails.plan_id === 3" class="book-demo-button" @click="handleModal('book-demo-modalbox')">Book a Demo</div>
                        </div>
                    </div>
                </div>
                <div class="know-more">To know more about plan & pricing <a href="https://panelstack.com/pricing" target="_blank">click here</a>.</div>
            </div>
        </div>
        <div class="modal-background hide" id="modal-background"></div>
        <div class="modal-container hide" id="modal-container">
            <div v-if="contactSalesModalBox" class="contact-sales-modalbox">
                <div class="cancel-icon" @click="handleModal('close')">
                    <img src="../../assets/drop/group-167.png" alt="X" height="90%" width="90%" />
                </div>
                <form class="form-container">
                    <div class="title">Contact Sales</div>
                    <div class="input-container">
                        <input v-model="contactOrganizationName" placeholder="Organization Name (Auto fill, Editable)" required>
                    </div>
                    <div class="input-container">
                        <input v-model="contactEmail" placeholder="Email Id (Auto fill, Editable)" required>
                    </div>
                    <div class="input-container-mobile">
                        <div class="country-code">
                            <vue-tel-input @country-changed="setCountryCode" ></vue-tel-input>
                        </div>
                        <div class="mobile-number">
                            <input v-model="contactMobileNumber" placeholder="Contact Number (Auto fill, Editable)" required>
                        </div>
                    </div>
                    <div class="textarea-container">
                        <textarea v-model="contactMessage" placeholder="Enterprise: More than 5 users (Auto fill, Editable)"></textarea>
                    </div>
                    <div class="button-container">
                        <div class="button" @click="sendSalesRequest('close')">Send Query</div>
                    </div>
                </form>
            </div>
            <div v-if="cancelSubscriptionModalBox" class="cancel-subscription-modalbox">
                <div class="title-block">
                    <div>Cancel Subscription</div>
                    <div class="cancel-icon" @click="handleModal('close')">
                        <img src="../../assets/drop/group-166.png" alt="X" height="90%" width="90%" />
                    </div>
                </div>
                <div class="form-container">
                    <div class="radio-button-group">
                        <div class="question">What’s your reason for cancelling?</div>
                        <div class="radio-button">
                            <input type="radio" id="one" value="expensive" v-model="cancelSubscriptionOption" style="margin: 0">
                            <div style="margin-left: 15px">Too expensive</div>
                        </div>
                        <div class="radio-button">
                            <input type="radio" id="t" value="nousage" v-model="cancelSubscriptionOption" style="margin: 0">
                            <div style="margin-left: 15px">Not of much usage for me</div>
                        </div>
                        <div class="radio-button">
                            <input type="radio" id="e" value="other" v-model="cancelSubscriptionOption" style="margin: 0">
                            <div style="margin-left: 15px">Other</div>
                        </div>
                        <div class="cancel-reason disabled">
                            <textarea id="cancel-reason-textarea" class="disabled" v-model="cancelReasonMessage" placeholder="Please describe…" disabled></textarea>
                        </div>
                    </div>
                    <div class="warning-message">You will be able to use all the features of Panelstack till your next billing cycle.</div>
                    <div class="button-container">
                        <div class="button button-not-active" id="cancel-subscription-button" @click="cancelSubscription">Cancel Subscription</div>
                    </div>
                </div>
            </div>
            <div v-if="bookDemoModalBox" class="book-demo-modalbox-wrapper">
                <div class="book-demo-modalbox">
                    <div class="check-mark-block">
                        <img name="check"  src="../../assets/drop/check-circle.png" alt="V" height="100%" width="100%" />
                    </div>
                    <div class="text">Your request has been submitted successfully.</div>
                    <div class="text">Our sales team will contact you shortly.</div>
                    <div class="btn" @click="handleModal('close')">Ok</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { USER_TIER } from '@/pages/constants';
import navBar from '@/components/ui/navBar/navBar.vue';
import liteTier from './pricingTiers/liteTier.vue';
import basicTier from './pricingTiers/basicTier.vue';
import { VueTelInput } from 'vue-tel-input';
import API from '@/services/api';
import { calculateDiffBtwTwoDates } from '../../core/utils/mathUtils';
import { expiryPopupDisplay, monthNumbers } from '../../core/utils/utils';
import { mapState } from 'pinia';
import { useOrganisationStore } from '../../stores/organisation';
export default {
    name: 'Pricing',
    components: {
        liteTier,
        basicTier,
        navBar,
        VueTelInput,
    },
    data() {
        return {
            currentPage: 'pricing',
            contactSalesModalBox: false,
            cancelSubscriptionModalBox: false,
            bookDemoModalBox: false,
            activePlan: undefined,
            activePlanUsers: 0,
            activePlanPrice: 0,
            nonActivePlans: [],
            LitePlan: {},
            enterprisePlans: [],
            allPlans: [],
            planExist: false,
            isActivePlan: false,
            cancelSubscriptionOption: null,
            cancelReasonMessage: '',
            contactMessage: '',
            contactMobileNumber: '',
            contactEmail: '',
            contactOrganizationName: '',
            contactCountryCode: '',
            basicFeatures: ['Unlimited Residential Designs Projects', 'Unlimited Commercial Design Projects 200 kW', 'Unlimited Commercial Design Projects > 200 kW'],
            liteFeatures: ['300 Residential Designs Projects', '60 Commercial Design Projects 200 kW'],
            activeDropdownValue: 'Add More Users',
            expiryDays: 31,
            isAdmin: false,
        };
    },
    nonReactiveData() {
        return {
            USER_TIER,
        };
    },
    computed: {
        ...mapState(useOrganisationStore, {
            userTier: 'GET_USER_TIER',
            pricingPlansDetails: 'GET_PRICING_PLANS_DETAILS',
        }),
    },
    created() {
        expiryPopupDisplay.isPricingPage = true;
    },
    methods: {
        goBack() {
            window.history.length > 1
                ? this.$router.go(-1)
                : this.$router.push('/')
        },
        handleDropdown(val) {
            const next1 = (val + 1) > 3 ? (val + 1) % 3 : (val + 1);
            const next2 = (val + 2) > 3 ? (val + 2) % 3 : (val + 2);
            if ( !this.isAdmin ) {
                return;
            }
            if (document.getElementById(`dropdown-list${val}`).classList.contains('open')) {
                document.getElementById(`dropdown-list${val}`).classList.remove('open');
                document.getElementById(`dropdown-list${val}`).classList.add('hide');
            }
            else {
                document.getElementById(`dropdown-list${val}`).classList.remove('hide');
                document.getElementById(`dropdown-list${val}`).classList.add('open');
            }
            document.getElementById(`dropdown-list${next1}`).classList.remove('open');
            document.getElementById(`dropdown-list${next1}`).classList.add('hide');
            document.getElementById(`dropdown-list${next2}`).classList.remove('open');
            document.getElementById(`dropdown-list${next2}`).classList.add('hide');
            if (document.getElementById('cancel-subscription').classList.contains('open')) {
                document.getElementById('cancel-subscription').classList.remove('open');
                document.getElementById('cancel-subscription').classList.add('hide');
            }
        },
        handleCancelSubscription(e) {
            if (document.getElementById('cancel-subscription').classList.contains('open')) {
                document.getElementById('cancel-subscription').classList.remove('open');
                document.getElementById('cancel-subscription').classList.add('hide');
            }
            else {
                document.getElementById('cancel-subscription').classList.remove('hide');
                document.getElementById('cancel-subscription').classList.add('open');
            }
        },
        handleModal(id, { message, index } = {message: '', index: null}) {
            if (this.pricingPlansDetails.plan_id === 3 && id !== 'book-demo-modalbox' && id !== 'close') {
                return;
            }
            if (document.getElementById('modal-container').classList.contains('open')) {
                document.getElementById('modal-container').classList.remove('open');
                document.getElementById('modal-container').classList.add('hide');
                document.getElementById('modal-background').classList.remove('open');
                document.getElementById('modal-background').classList.add('hide');
            }
            else {
                document.getElementById('modal-container').classList.remove('hide')
                document.getElementById('modal-container').classList.add('open');
                document.getElementById('modal-background').classList.remove('hide');
                document.getElementById('modal-background').classList.add('open');
            }
            if (id === 'contact-sales-modalbox') {
                this.sendSalesRequest(null);
                this.setOrganisationDetails();
                this.contactMessage = message;
                this.cancelSubscriptionModalBox = false;
                this.contactSalesModalBox = true;
                this.bookDemoModalBox = false;
                if (index) {
                    document.getElementById(`dropdown-list${index}`).classList.remove('open');
                    document.getElementById(`dropdown-list${index}`).classList.add('hide');
                }
            }
            else if (id === 'cancel-subscription-modalbox') {
                this.contactSalesModalBox = false;
                this.cancelSubscriptionModalBox = true;
                this.bookDemoModalBox = false;
                // document.getElementById('cancel-subscription').style.display = 'none';
                // document.getElementById('cancel-subscription').classList.remove('open');
                // document.getElementById('cancel-subscription').classList.add('hide');
            }
            else if (id === 'book-demo-modalbox') {
                this.contactSalesModalBox = false;
                this.cancelSubscriptionModalBox = false;
                this.bookDemoModalBox = true;
            }
        },
        setPlans(plans) {
            if (plans.plan_id && plans.plan_id !== 3) {
                this.isActivePlan = true;
            }
            plans.allAvailablePricingPlans.forEach(plan => {
                if (plan.plan_type === 3) {
                    this.allPlans.unshift(plan);
                }
                else {
                    this.allPlans.push(plan);
                }
            });
            this.allPlans.forEach(plan => {
                if (plan.plan_type === 2) {
                    if (plan.id === plans.plan_id) {
                        this.planExist = true;
                        this.activePlan = plan;
                        this.activePlanPrice = plan.actual_price / plan.number_of_seats;
                    }
                    else if (plans.number_of_users === plan.number_of_seats) {
                        this.nonActivePlans.push(plan);
                    }
                }
                else if (plan.plan_type === 3) {
                    if (plan.id === plans.plan_id) {
                        this.planExist = true;
                        this.activePlan = plan;
                    }
                    else if (plans.number_of_users === plan.number_of_seats) {
                        this.nonActivePlans.push(plan);
                    }
                }
                else if (!this.planExist && plan.id === plans.plan_id) {
                    this.activePlan = plan;
                }
                else if (plan.plan_type === 4 && plan.number_of_seats === plans.number_of_users) {
                    this.enterprisePlans.push(plan);
                }
                // else if (plan.Name.toLowerCase() === 'enterprise' && plans.number_of_users === plan.number_of_seats) {
                //     this.allPlans.push(plan);
                // }
            });
            // if (plans.plan_id === 3) {
            //     this.nonActivePlans[1] = this.activePlan;
            // }
            this.activePlanUsers = plans.number_of_users;
            this.$forceUpdate();
        },
        changePlansWithUser(user, name, arrayIndex, isEnterprise = false) {
            try {
                this.pricingPlansDetails.allAvailablePricingPlans.forEach(pricingPlan => {
                if (pricingPlan.Name.toLowerCase() === name.toLowerCase() && pricingPlan.number_of_seats === user) {
                    if (arrayIndex !== 'active') {
                        if (isEnterprise) {
                            this.enterprisePlans[0] = pricingPlan;
                        }
                        else {
                            this.nonActivePlans[arrayIndex] = pricingPlan;
                        }
                    }
                    else {
                        if (this.expiryDays < 0) {
                            this.activePlan = pricingPlan;
                            this.activeDropdownValue = `${user} User`;
                            this.activePlanUsers = pricingPlan.number_of_seats;
                            this.activePlanPrice = pricingPlan.actual_price / pricingPlan.number_of_seats;
                        }
                        else {
                            this.activeDropdownValue = `${user} User`;
                            this.activePlanPrice = pricingPlan.actual_price / pricingPlan.number_of_seats;
                            this.activePlanUsers = pricingPlan.number_of_seats;
                        }
                    }
                }
                // else if (arrayIndex === 'active') {
                //     this.activeDropdownValue = `${user} User`;
                // }
            })
            }
            catch(e) {
                console.error(e);
            }
            finally {
                if (isEnterprise) {
                    document.getElementById(`dropdown-list${3}`).classList.remove('open');
                    document.getElementById(`dropdown-list${3}`).classList.add('hide');
                }
                else if (arrayIndex === 0) {
                    document.getElementById(`dropdown-list${1}`).classList.remove('open');
                    document.getElementById(`dropdown-list${1}`).classList.add('hide');
                }
                else if (arrayIndex === 1 || arrayIndex === 'active') {
                    document.getElementById(`dropdown-list${2}`).classList.remove('open');
                    document.getElementById(`dropdown-list${2}`).classList.add('hide');
                }
            }

            this.$forceUpdate(); // This will render html again when there is change in properties values.
        },
        handleOrderSummary(plan, { isSwitch, addUser, addon, renew } = { isSwitch: false, addUser: false, addon: false, renew: false }) {
            if (this.pricingPlansDetails.plan_id === 3) {
                return;
            }
            if (isSwitch) {
                const amount = (plan.actual_price) - ((calculateDiffBtwTwoDates(this.pricingPlansDetails.end_date, this.pricingPlansDetails.start_date) / 365) * (this.activePlan.actual_price));
                const planObj = {
                    plan_amount: amount,
                    plan_name: plan.Name,
                    plan_id: plan.id,
                    isRenew: false,
                    new_users: plan.number_of_seats,
                    existing_users: this.pricingPlansDetails.number_of_users,
                    message: this.expiryDays < 31 ? `All the users can use the upgraded plan from today itself. The billing cycle for this plan will however start from ${this.setExpiryRenewalDate('billing')}` : `Your plan will expire on ${this.setExpiryRenewalDate('expiry')} and the plan will be auto-renewed on ${this.setExpiryRenewalDate('billing')}`,
                }
                this.redirectRouter(planObj);
            }
            else if (addUser) {
                const planObj = {
                    plan_amount: this.activePlanPrice * this.activePlanUsers,
                    plan_name: plan.Name,
                    plan_id: plan.id,
                    isRenew: false,
                    new_users: this.activePlanUsers,
                    existing_users: this.pricingPlansDetails.number_of_users,
                    message: `Your plan subscription ends on ${this.setExpiryRenewalDate('expiry')}. Recently added users can however enjoy the plan from today itself. Your plan would be auto-renewed on ${this.setExpiryRenewalDate('billing')}`,
                };
                this.redirectRouter(planObj);
            }
            else if (addon) {
                const planObj = {
                    plan_amount: 0,
                    plan_name: plan.Name,
                    plan_id: plan.id,
                    isRenew: false,
                    new_users: 0,
                    existing_users: 0,
                    message: `Your plan will be auto-renewed on ${this.setExpiryRenewalDate('billing')}`
                };
                this.redirectRouter(planObj);
            }
            else if (renew) {
                const planObj = {
                    plan_amount: this.activeDropdownValue === 'Add More Users' ? this.activePlanPrice * this.pricingPlansDetails.number_of_users : this.activePlanPrice * this.pricingPlansDetails.number_of_users * this.activePlanUsers,
                    plan_name: plan.Name,
                    plan_id: plan.id,
                    isRenew: this.expiryDays < 0 ? false : (this.activeDropdownValue === 'Add More Users' ? false : true),
                    new_users: this.activePlanUsers,
                    existing_users: this.pricingPlansDetails.number_of_users,
                    message: this.expiryDays < 0 ? `Your plan will be auto-renewed on ${this.setExpiryRenewalDate('billing')}` : `All the users can use the upgraded plan from today itself. The billing cycle for this plan will however start from ${this.setExpiryRenewalDate('billing')}`,
                };
                this.redirectRouter(planObj);
            }
            else {
                const planObj = {
                    plan_amount: plan.actual_price,
                    plan_name: plan.Name,
                    plan_id: plan.id,
                    isRenew: false,
                    new_users: plan.number_of_seats,
                    existing_users: this.pricingPlansDetails.number_of_users,
                    message: `Your plan will expire on ${this.setExpiryRenewalDate('expiry')} and the plan will be auto-renewed on ${this.setExpiryRenewalDate('billing')}`,
                }
                this.redirectRouter(planObj);
            }
        },
        redirectRouter(plan) {
            this.$router.push({ name: 'orderSummary', params: { selectedPlan: plan }});
        },
        setCountryCode(country) {
            this.contactCountryCode = country.dialCode;
        },
        async cancelSubscription() {
            const response = await API.USERS.CANCEL_PLAN_SUBSCRIPTION();
            if (response.data.status === 200) {
                this.handleModal('close');
                this.$toastr.s('Your request has been submitted successfully');
            }
        },
        convertDateFormat(date) {
            const tempDate = date.split('-');
            return `${tempDate[2]}-${monthNumbers[parseInt(tempDate[1])]}-${tempDate[0]}`
        },
        async checkIsAdmin() {
            // to-do move to store
            const { role } = { ...JSON.parse(localStorage.getItem('user')) };
            // this.isAdmin = (await API.USERS.FETCH_USER(user_id)).data.role !== null;
            this.isAdmin = role === 'ADMIN';
        },
        closeAllDropdowns(e) {
            if (!(e.target.name === 'dropdown' || e.target.classList.contains('dropdown-p'))) {
                document.getElementById("dropdown-list1").classList.remove('open');
                document.getElementById("dropdown-list2").classList.remove('open');
                document.getElementById("dropdown-list3").classList.remove('open');
                document.getElementById('cancel-subscription').classList.remove('open');

                document.getElementById("dropdown-list1").classList.add('hide');
                document.getElementById("dropdown-list2").classList.add('hide');
                document.getElementById("dropdown-list3").classList.add('hide');
                document.getElementById('cancel-subscription').classList.add('hide');
            }
        },
        setExpiryRenewalDate(type) {
            if (type === 'billing') {
                const start_date = this.pricingPlansDetails.start_date.split('-');
                let start_date_month = parseInt(start_date[1]);
                let start_date_year = parseInt(start_date[0]);
                let add_months = parseInt(this.activePlan.frequency) + start_date_month;
                if (add_months > 12) {
                    start_date_year += 1;
                    add_months = (start_date_month + add_months) % 12; 
                }
                return `${start_date[2]} ${monthNumbers[add_months]} ${start_date_year}`;
            } 
            else if (type === 'expiry') {
                const end_date = this.pricingPlansDetails.end_date.split('-');
                return `${end_date[2]} ${monthNumbers[parseInt(end_date[1])]} ${end_date[0]}`;
            }
        },
        async setOrganisationDetails() {
            const user = JSON.parse(localStorage.getItem('user')) || {};
            const organisationId = user.organisation_id;
            try {
                const { data } = await API.ORGANISATION.FETCH_ORGANISATION(organisationId);
                this.contactOrganizationName = data.name;
                this.contactEmail = data.email_id;
                this.contactMobileNumber = data.phone;
            }
            catch(e) {
                console.error(e);
            }
            finally {
                return;
            }
        },
        async sendSalesRequest(type) {
            try {
                await API.ORGANISATION.POST_PLAN_UPGRADATION_REQUEST();
                if (type === 'close') {
                    this.handleModal('close');
                    this.$toastr.s('Your request has been submitted successfully');
                }
            }
            catch(e) {

            }
        }
    },
    mounted() {
        this.checkIsAdmin();
        this.setPlans(this.pricingPlansDetails);
        this.expiryDays = calculateDiffBtwTwoDates(this.pricingPlansDetails.end_date);
        // this.expiryDays = -1;
        this.setOrganisationDetails();
        document.addEventListener('click', this.closeAllDropdowns);
    },
    updated() {
    },
    destroyed() {
        expiryPopupDisplay.isPricingPage = false;
        document.removeEventListener('click', this.closeAllDropdowns);
        if (this.pricingPlansDetails.plan_id === 3) {
            this.$router.push({ name: 'pricing' });
        }
    },
    watch: {
        cancelSubscriptionOption(newVal) {
            if (newVal === 'other') {
                document.getElementById('cancel-reason-textarea').classList.remove('disabled');
                document.getElementById('cancel-reason-textarea').disabled = false;
                if (this.cancelReasonMessage === '') {
                    document.getElementById('cancel-subscription-button').classList.add('button-not-active');
                }
            }
            else {
                document.getElementById('cancel-reason-textarea').classList.add('disabled');
                document.getElementById('cancel-reason-textarea').disabled = true;
                document.getElementById('cancel-subscription-button').classList.remove('button-not-active');
            }
        },
        cancelReasonMessage(newVal) {
            if (this.cancelReasonMessage !== '') {
                document.getElementById('cancel-subscription-button').classList.remove('button-not-active');
            }
            else if (this.cancelReasonMessage === '') {
                document.getElementById('cancel-subscription-button').classList.add('button-not-active');
            }
        },
        nonActivePlans(newVal) {
            // console.log("new plans", newVal)
        }
        // contactCountryCode(newVal) {
        //     console.log("country code", newVal)
        // }
    }
};
</script>

<style scoped>
.pricingWrapper {
    padding: 80px 18% 0 18%;
}
@media only screen {
    .hide {
        display: none;
    }
    .disabled {
        cursor: not-allowed !important;
    }
    .button-not-active {
        cursor: not-allowed !important;
        background-image: linear-gradient(to bottom, #e5e5e5, #cccccc) !important;
    }
    button {
        border: none;
        outline: none;
    }
    /* .open {
        display: flex;
    } */
    .pricing-container {
        box-sizing: border-box;
        /* height: calc(100vh - 55px); */
        min-height: calc(100vh - 55px);
        /* max-height: calc(100vh - 55px); */
        width: 100vw;
        min-width: 100vw;
        max-width: 100vw;
        background-color: #f5f7fa;
        overflow: hidden scroll;
    }
    .pricing-container-wrapper {
        height: auto;
        min-height: 900px;
        min-width: 100%;
        /* max-width: 100%; */
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
    }
    .card-container {
        position: relative;
        height: auto;
        min-height: 750px;
        /* min-height: 600px; */
        /* max-height: 100%; */
        width: 100%;
        max-width: 1400px;
        /* min-width: 1400px; */
        /* min-width: 70%; */
        /* max-width: 1400px; */
        /* background: #409EFF; */
        padding: 50px 0;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-evenly;
    }
    .pricing-container-wrapper .know-more {
        width: 100%;
        max-width: 1400px;
        margin: 0 0 25px 100px;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1rem;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        text-align: left;
        color: #222222;
    }
    .pricing-container-wrapper .expiry-block {
        height: auto;
        width: 100%;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        letter-spacing: normal;
        font-stretch: normal;
        font-style: normal;
        text-align: center;
    }
    .pricing-container-wrapper .expiry-block .top {
        /* position: absolute; */
        margin: 40px 0 0 0;
        font-size: 1.5rem;
        font-weight: 500;
        color: #ff0808;
    }
    .pricing-container-wrapper .expiry-block .bottom {
        margin: 15px 0 0 0;
        font-size: 1rem;
        font-weight: normal;
        color: #222222;
    }
    .plan-card-wrapper {
        box-sizing: border-box;
        height: auto;
        width: 31%;
        max-width: 432px;
    }
    .plan-card {
        position: relative;
        box-sizing: border-box;
        min-height: 760px;
        /* min-height: 500px;
        max-height: 829px; */
        width: 100%;
        /* max-width: 432px; */
        /* min-width: 30%;
        max-width: 435px; */
        border-radius: 24px;
        border: solid 1px #cccccc;
        background-color: #ffffff;
        padding: 34px 5.5% 34px 7%;
        /* padding-left: 20px;
        padding-top: 10px;
        padding-right: 15px; */
        display: flex;
        flex-direction: column;
        justify-content: flex-start;

    }
    .plan-card.active {
        height: auto;
    }
    .plan-card.margin {
        margin-top: 85px;
    }
    .plan-card .three-dots-icon {
        box-sizing: border-box;
        position: absolute;
        top: 34px;
        right: 8px;
        height: 24px;
        min-height: 24px;
        max-height: 24px;
        width: 24px;
        min-width: 24px;
        max-width: 24px;
        /* margin: 4px 0 0 363px; */
        /* padding: 2px 6px; */
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
    .plan-card .three-dots-icon .cancel-subscription.open {
        position: absolute;
        top: 30px;
        right: 10px;
        width: 217px;
        height: 64px;
        /* padding: 0 10px; */
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
        border: solid 1px #eeeeee;
        background-color: #ffffff;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1.2rem;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        /* line-height: 2.33; */
        letter-spacing: normal;
        text-align: center;
        color: #222222;
        z-index: 100;
    }
    .title-block {
        /* height: 14%; */
        /* max-height: 90px; */
        /* width: 100%; */
        /* min-width: 100%;
        max-width: 100%; */
        height: 73px;
        margin: 0 37px 0 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        /* border: 1px solid black; */
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 2.25rem;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.4;
        letter-spacing: normal;
        text-align: left;
        color: #222222;;
    }
    .title-block.active {
        width: 229px;
        height: 73px;
        margin: 0 0 0 7.5px;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        /* font-size: 1.5rem; */
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.4;
        letter-spacing: normal;
        text-align: left;
        color: #ffffff;
    }
    .title-block .choice {
        font-size: 1.25rem;
        color: #777777;
    }
    .user-dropdown-block {
        height: 72px;
        /* min-height: 10%;
        max-height: 70px; */
        width: 100%;
        /* min-width: 100%;
        max-width: 376px; */
        margin: 21px 0 0 3px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        /* align-items: center; */
        background-color: #ffffff;
    }
    .user-dropdown-block.active {
        margin: 21px 0 0 0;
        background-color: #1c3366;
    }
    .user-dropdown-block .dropdown-menu {
        box-sizing: border-box;
        position: relative;
        height: 100%;
        width: 100%;
        padding: 23px 16.5px 24px;
        border: solid 1px #1c3366;
        border-radius: 8px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-stretch: normal;
        letter-spacing: normal;
        font-style: normal;
        font-size: 1rem;
        color: #1c3366;
        font-weight: bold;
        cursor: pointer;
    }
    .user-dropdown-block .dropdown-menu.active {
        border: solid 1px #ffffff;
        color: #ffffff;
    }
    .user-dropdown-block .dropdown-line {
        height: 1px;
        min-height: 1px;
        position: relative;
        width: 100%;
        min-width: 100%;
    }
    .user-dropdown-block .dropdown-line .dropdown-list {
        box-sizing: border-box;
        position: absolute;
        top: 5px;
        /* width: 369px; */
        height: 384px;
        /* margin: 8px 11.5px 50px 11px; */
        padding: 20px 1px 25px 0;
        border-radius: 8px;
        box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.1);
        border: solid 1px #eeeeee;
        background-color: #ffffff;
    }
    .user-dropdown-block .dropdown-list.open {
        display: flex;
        flex-direction: column;
    }
    .user-dropdown-block .dropdown-list .list-item {
        box-sizing: border-box;
        width: 100%;
        height: 48px;
        padding: 0 17px;
        cursor: pointer;
        display: flex;
        flex-direction: row;
        align-items: center;
        font-family:  "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1rem;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        color: #222222;
    }
    .user-dropdown-block .dropdown-list .list-item:hover {
        background-color: #f5f7fa;
    }
    .user-dropdown-block .dropdown-list .line {
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        height: 1px;
        min-height: 1px;
        max-height: 1px;
        background-color: #cccccc;
        margin: 2px 0;
    }
    .user-dropdown-block .dropdown-list .contact-message {
        /* height: 20px;
        min-height: 20px;
        max-height: 20px; */
        box-sizing: border-box;
        padding: 16px 15.5px 12px;
        width: 100%;
        /* padding: 0 10px; */
        font-size: 1rem;
        font-weight: normal;
        font-style: normal;
        line-height: 1.5;
        text-align: left;
        color: #222222;
    }
    .user-dropdown-block .dropdown-list .button {
        box-sizing: border-box;
        width: 144px;
        height: 48px;
        min-height: 48px;
        max-height: 48px;
        margin: 0 0 0 17px;
        /* padding: 1px 19px 16px 15.5px; */
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 4px;
        background-image: linear-gradient(to bottom, #409EFF, #3092F7);
        cursor: pointer;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1rem;
        font-weight: bold;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        color: #ffffff;
        cursor: pointer;
        pointer-events: all;
    }
    .price-block {
        height: 33px;
        min-height: 10%;
        max-height: 60px;
        width: 206px;
        /* min-width: 100%;
        max-width: 376px; */
        /* border: 1px solid black; */
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        font-weight: bold;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        text-align: left;
        color: #1c3366;
    }
    /* .price-block.active {
        height: 11% !important;
    } */
    .price-top {
        width: 206px;
        height: 33px;
        margin: 33px 0 0 0;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1.25rem;
        font-weight: bold;
        font-stretch: normal;
        font-style: normal;
        /* line-height: 3.5; */
        letter-spacing: normal;
        text-align: left;
        color: #1c3366;
    }
    .price-top.active {
        margin: 25px 0 0;
        color: #ffffff;
    }
    .price-bottom {
        width: 87px;
        height: 18px;
        margin: 6px 0 0 0;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1rem;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        /* line-height: 4.38; */
        letter-spacing: normal;
        text-align: left;
        color: #777777;
    }
    .price-bottom.active {
        margin: 6px 0 0;
        color: #cccccc;
    }
    .active-plan-model {
        box-sizing: border-box;
        height: 67%;
        min-height: 67%;
        max-height: 620px;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: column;
    }
    .plan-description-block {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
    }
    .plan-description-block .top {
        height: 45%;
        min-height: 45%;
        max-height: 45%;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    .plan-description-block .bottom {
        height: 55%;
        min-height: 55%;
        max-height: 55%;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    /* .plan-description-block .left,.plan-description-block .right {
        height: 100%;
        min-height: 100%;
        max-height: 100%;
        width: 50%;
        min-width: 50%;
        max-width: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    } */
    .plan-description-block .block-up, .plan-description-block .block-down {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
    }
    .plan-description-block .block-tl {
        box-sizing: border-box;
        width: 184px;
        height: 79px;
        margin: 23px 0 0;
        padding: 20px 0 19px 16px;
        border-radius: 8px;
        background-color: #2c4272;
    }
    .plan-description-block .block-tr {
        box-sizing: border-box;
        width: 184px;
        height: 79px;
        margin: 23px 0 0 16px;
        padding: 20px 0 19px 17px;
        border-radius: 8px;
        background-color: #2c4272;
    }
    .plan-description-block .block-bl {
        box-sizing: border-box;
        width: 184px;
        height: 96px;
        margin: 16px 0 0 0;
        padding: 17px 0 17px 16px;
        border-radius: 8px;
        background-color: #2c4272;
    }
    .plan-description-block .block-br {
        box-sizing: border-box;
        width: 184px;
        height: 96px;
        margin: 16px 0 0 16px;
        padding: 17px 0 17px 16px;
        border-radius: 8px;
        background-color: #2c4272;
    }
    .plan-description-block .data {
        /* width: 84px; */
        height: 40px;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1rem;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        line-height: 1.38;
        letter-spacing: normal;
        text-align: left;
        color: #cccccc;
    }
    .plan-description-block .data .down {
        font-weight: bold;
        color: #ffffff;
    }
    .plan-description-block .block .down {
        font-weight: bold;
        margin-top: 2px;
        font-size: 1rem;
    }
    .add-ons-block {
        box-sizing: border-box;
        /* height: 35%; */
        min-height: 125px;
        /* max-height: 280px; */
        width: 100%;
        min-width: 100%;
        /* max-width: 100%; */
        /* border: 1px solid black; */
        display: flex;
        flex-direction: column;
        margin: 0 0 27px;
        visibility: hidden;
    }
    .add-ons-block .addon-title-block {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1.25rem;
        font-weight: bold;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        color: #ffffff;
    }
    .add-ons-block .addon-title-block .left {
        width: 81px;
        height: 24px;
        margin: 20px 0 0 0;
        font-size: 1.25rem;
        font-weight: bold;
        text-align: left;
    }
    .add-ons-block .addon-title-block .right {
        width: 39px;
        height: 19px;
        margin: 24px 0 0 0;
        font-size: 1rem;
        font-weight: 500;
        text-align: right;
    }
    .add-ons-block .addon-features-block {
        
    }
    .add-ons-block .addon-features-block .feature-block {
        /* height: 35px; */
        /* min-height: 35px; */
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
    }
    .add-ons-block .addon-features-block .feature-block .bullet-point {
        width: 8px;
        min-width: 8px;
        height: 8px;
        border-radius: 50%;
        margin: 21px 0 0 0;
        background-color: #cccccc;
    }
    .add-ons-block .addon-features-block .feature-block .text {
        margin: 16px 0 0 13px;
        text-overflow: ellipsis;
        font-size: 1rem;
        font-weight: normal;
        text-align: left;
        color: #cccccc;
    }
    .add-ons-block .addon-features-block .feature-block .used {
        margin: 16px 0 0 70px;
        font-size: 1rem;
        font-weight: normal;
        text-align: right;
        color: #cccccc;
    }
    .button {
        width: 100%;
        height: 72px;
        min-height: 72px;
        max-height: 72px;
        margin: 32px 0 0 0;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 8px;
        border: solid 1px #409EFF;
        background-color: #ffffff;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1rem;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        text-align: center;
        color: #409EFF;
        cursor: pointer;
        pointer-events: all;
    }
    .book-demo-button {
        margin: 40px 0 0;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1.25rem;
        font-weight: bold;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        text-align: center;
        text-decoration: underline;
        color: #1c3366;
        cursor: pointer;
    }
    .button.active {
        margin: 0;
        border: solid 1px #ffffff;
        background-color: #1c3366;
        color: #ffffff;
    }
    .button.active {
        margin: 0;
        border: solid 1px #ffffff;
        background-color: #1c3366;
        color: #ffffff;
    }
    .active-plan-model .button-block .button {
        height: 90%;
        min-height: 90%;
        max-height: 90%;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        border-radius: 7px;
        border: solid 1px #ffffff;
        background-color: #1c3366;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 14px;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        /* line-height: 4.38; */
        letter-spacing: normal;
        /* text-align: center; */
        color: #ffffff;
        cursor: pointer;
        pointer-events: all;
    }
    .plan-features-block {
        min-height: 324px;
        /* width: 100%;
        min-width: 100%;
        max-width: 100%;
        padding: 10px 0 5px 0;
        display: flex;
        flex-direction: column;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;;
        font-size: 1rem;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        color: #222222; */
    }
    .plan-features-block .feature-block {
        display: flex;
        flex-direction: row;
        justify-content: flex-start;
    }
    .plan-features-block .feature-block .bullet-point {
        width: 12px;
        min-width: 12px;
        height: 12px;
        min-height: 12px;
        margin: 37px 0 0 0;
        border-radius: 50%;
        background-color: #1c3366;
    }
    .plan-features-block .feature-block .text {
        /* width: 235px; */
        /* height: 18px; */
        margin: 33px 0 0 20px;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1rem;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        /* line-height: 4.38; */
        letter-spacing: normal;
        text-align: left;
        color: #222222;
    }
    .modal-container.open {
        position: fixed;
        box-sizing: border-box;
        top: 0;
        left: 0;
        height: 100vh;
        /* min-height: 100vh;
        max-height: 100vh; */
        width: 100vw;
        min-width: 100vw;
        max-width: 100vw;
        /* background-color: #000000; */
        /* opacity: 0.5; */
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1005;
        pointer-events: none;
    }
    .modal-background.open {
        box-sizing: border-box;
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        /* min-height: 100vh;
        max-height: 100vh; */
        width: 100vw;
        min-width: 100vw;
        max-width: 100vw;
        display: flex;
        opacity: 0.5;
        background-color: #000000;
        z-index: 1000;
    }
    .modal-container .contact-sales-modalbox {
        box-sizing: border-box;
        position: relative;
        width: 25%;
        min-width: 450px;
        max-width: 625px;
        height: 47%;
        min-height: 400px;
        max-height: 641px;
        border-radius: 14px;
        opacity: 1;
        background-color: #ffffff;
        display: flex;
        justify-content: center;
        align-items: center;
        pointer-events: all;
    }
    .modal-container .contact-sales-modalbox .cancel-icon {
        position: absolute;
        top: 10px;
        right: 10px;
        height: 20px;
        min-height: 20px;
        width: 20px;
        min-width: 20px;
        cursor: pointer;
    }
    .modal-container .contact-sales-modalbox .form-container {
        box-sizing: border-box;
        height: 94%;
        min-height: 94%;
        max-height: 94%;
        width: 80%;
        /* min-width: 75%; */
        /* max-width: 75%; */
        padding: 10px 10px;
        display: flex;
        flex-direction: column;
        /* justify-content: center; */
    }
    .modal-container .contact-sales-modalbox .form-container .title {
        height: 10%;
        min-height: 10%;
        max-height: 10%;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1.25rem;
        font-weight: 500;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        text-align: center;
        color: #222222;
    }
    .modal-container .contact-sales-modalbox .form-container .input-container {
        box-sizing: border-box;
        height: 16%;
        min-height: 16%;
        /* max-height: 60px; */
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 1rem;
        color: #222222;
    }
    .modal-container .contact-sales-modalbox .form-container .input-container input {
        box-sizing: border-box;
        height: 40px;
        min-height: 40px;
        max-height: 50px;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        padding: 0 10px;
        border-radius: 4px;
        background-color: #f5f7fa;
        border: none;
    }
    .modal-container .contact-sales-modalbox .form-container .input-container-mobile {
        box-sizing: border-box;
        height: 16%;
        min-height: 16%;
        max-height: 16%;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-size: 1rem;
        color: #222222;
    }
    .modal-container .contact-sales-modalbox .form-container .input-container-mobile .country-code {
        height: 40px;
        min-height: 40px;
        max-height: 40px;
        width: 22%;
        min-width: 22%;
        max-width: 22%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .vue-tel-input {
        width: 100% !important;
        min-width: 100% !important;
        height: 40px !important;
        min-height: 40px !important;
    }
    .vti__dropdown {
        width: 100% !important;
        min-width: 100% !important;
    }
    .vue-tel-input .vti__input {
        display: none !important;
    }
    .vue-tel-input .vti__dropdown .vti__dropdown-list {
        max-width: 330px !important;
    }
    .modal-container .contact-sales-modalbox .form-container .input-container-mobile .mobile-number {
        box-sizing: border-box;
        height: 40px;
        min-height: 40px;
        max-height: 40px;
        width: 73%;
        min-width: 73%;
        max-width: 73%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .modal-container .contact-sales-modalbox .form-container .input-container-mobile .mobile-number input {
        box-sizing: border-box;
        height: 100%;
        min-height: 100%;
        max-height: 100%;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        padding: 0 10px;
        border-radius: 4px;
        background-color: #f5f7fa;
        border: none;
    }
    .modal-container .contact-sales-modalbox .form-container .textarea-container {
        box-sizing: border-box;
        height: 26%;
        min-height: 26%;
        max-height: 26%;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        font-size: 1rem;
        color: #222222;

    }
    .modal-container .contact-sales-modalbox .form-container .textarea-container textarea {
        box-sizing: border-box;
        height: 80px;
        min-height: 80px;
        max-height: 80px;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        padding: 2px 10px 0 10px;
        border-radius: 4px;
        background-color: #f5f7fa;
        border: none;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
    }
    .modal-container .contact-sales-modalbox .form-container .button-container {
        box-sizing: border-box;
        height: 16%;
        min-height: 16%;
        max-height: 16%;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        margin: 10px 0 0;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .modal-container .contact-sales-modalbox .form-container .button-container .button {
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        min-height: 80%;
        max-height: 75%;
        margin: 0;
        border-radius: 7px;
        background-image: linear-gradient(to bottom, #409EFF, #3092F7);
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 1.25rem;
        font-weight: bold;
        color: #ffffff;
        cursor: pointer;
        pointer-events: all;
    }
    .modal-container .cancel-subscription-modalbox {
        height: 50%;
        /* min-height: 50%; */
        max-height: 560px;
        width: 30%;
        max-width: 600px;
        border-radius: 16px;
        background-color: #ffffff;
        display: flex;
        flex-direction: column;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        pointer-events: all;
    }
    .modal-container .cancel-subscription-modalbox .title-block {
        box-sizing: border-box;
        height: 13%;
        max-height: 70px;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        padding: 0 20px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        font-size: 1.25rem;
        font-weight: 500;
        color: #ffffff;
        background-color: #1c3366;
        border-radius: 16px 16px 0 0;
    }
    .modal-container .cancel-subscription-modalbox .title-block .cancel-icon {
        height: 20px;
        width: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
    }
    .modal-container .cancel-subscription-modalbox .form-container {
        box-sizing: border-box;
        height: 87%;
        max-height: 490px;
        width: 100%;
        min-width: 100%;
        max-width: 100%;
        padding: 10px 20px 20px 20px;
        display: flex;
        flex-direction: column;

    }
    .modal-container .cancel-subscription-modalbox .form-container .radio-button-group {
        height: 70%;
        width: 100%;
        display: flex;
        flex-direction: column;
        padding: 10px 0 0 0;
    }
    .modal-container .cancel-subscription-modalbox .form-container .radio-button-group .question {
        height: 18%;
        width: 100%;
        font-size: 1.1rem;
        color: #222222;
        font-weight: normal;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .modal-container .cancel-subscription-modalbox .form-container .radio-button-group .radio-button {
        box-sizing: border-box;
        padding: 10px 0;
        height: 17%;
        width: 100%;
        font-size: 1rem;
        font-weight: normal;
        color: #222222;
        display: flex;
        flex-direction: row;
        align-items: center;
        cursor: pointer;
    }
    .modal-container .cancel-subscription-modalbox .form-container .radio-button-group .cancel-reason {
        box-sizing: border-box;
        /* padding: 10px 0; */
        height: 33%;
        width: 100%;
        margin-top: 2px;
        font-size: 1rem;
        font-weight: normal;
        color: #222222;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .modal-container .cancel-subscription-modalbox .form-container .radio-button-group .cancel-reason textarea {
        box-sizing: border-box;
        width: 100%;
        min-width: 100%;
        height: 100%;
        min-height: 100%;
        padding: 2px 10px 0 10px;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
    }
    .modal-container .cancel-subscription-modalbox .form-container .warning-message {
        height: 11%;
        width: 100%;
        margin: 5px 0;
        display: flex;
        flex-direction: row;
        align-items: center;
        font-weight: normal;
        font-size: 0.87rem;
        color: #222222;
    }
    .modal-container .cancel-subscription-modalbox .form-container .button-container {
        height: 18%;
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .modal-container .cancel-subscription-modalbox .form-container .button-container .button {
        height: 80%;
        min-height: 80%;
        max-height: 80%;
        width: auto;
        /* width: 45%; */
        padding: 0 25px;
        margin: 0;
        border: none;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 7px;
        background-image: linear-gradient(to bottom, #409EFF, #3092F7);
        font-weight: bold;
        font-size: 1.1rem;
        color: #ffffff;
        cursor: pointer;
        pointer-events: all;
    }
    .modal-container .book-demo-modalbox-wrapper {
        box-sizing: border-box;
        width: 28%;
        max-width: 472px;
        height: 38%;
        max-height: 328px;
        border-radius: 16px;
        background-color: #ffffff;
    }
    .modal-container .book-demo-modalbox {
        box-sizing: border-box;
        height: 100%;
        width: 100%;
        padding: 10% 0 4%;
        border-radius: 16px;
        display: flex;
        flex-direction: column;
        align-items: center;
        background-color: #ffffff;
    }
    .modal-container .book-demo-modalbox .check-mark-block {
        width: 68px;
        min-width: 68px;
        height: 68px;
        min-height: 68px;
        margin-bottom: 20px;
        object-fit: contain;
    }
    .modal-container .book-demo-modalbox .text {
        margin: 5px 0;
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1rem;
        font-weight: normal;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        text-align: center;
        color: #222222;
    }
    .modal-container .book-demo-modalbox .btn {
        box-sizing: border-box;
        margin-top: 25px;
        padding: 13px 64px 12px;
        border-radius: 4px;
        background-image: linear-gradient(to bottom, #409EFF, #3092F7);
        font-family: "Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif;
        font-size: 1.1rem;
        font-weight: bold;
        font-stretch: normal;
        font-style: normal;
        letter-spacing: normal;
        text-align: center;
        color: #ffffff;
        cursor: pointer;
        pointer-events: all;
    }



}
/* @media only screen and (min-width: 1400px) {
    .pricing-container {
        justify-content: center;
    }
    .pricing-container-wrapper {
        min-width: 100%;
    }
} */
/* @media only screen and (max-width: 1399px) {
} */
</style>
<style scoped>
:root {
    box-sizing: border-box !important;
    font-size: 16px;
}
body {
    box-sizing: border-box;
}
/* @media screen and (max-height: 749px) {
    :root {
        font-size: 14px !important;
    }
} */
#pricing .paddingDescriptionAndAddonCard {
    padding: 15px 20px;
}
#pricing .headingsAddOnType {
    color: #121212;
    font-size: 14px;
}

#pricing .headingsTier {
    color: #121212;
    font-size: 18px;
}

#pricing .headingsAddOns {
    color: #121212;
    font-size: 16px;
}

#pricing .descriptions {
    color: #707070;
    font-style: italic;
    font-size: 13px;
}
#pricing .planValidity {
    color: #409EFF;
    font-style: italic;
    font-size: 11px;
    padding-left: 10px;
}
.pricinghorizontalLine {
    border: 0.5px solid #c4c6cc;
}
#pricing .backButton {
    font-size: 23px;
    color: #303133;
}

#pricing .backButton:hover {
    font-weight: bold;
    cursor: pointer;
}
</style>
<style scoped>
.vue-tel-input {
    width: 100% !important;
    min-width: 100% !important;
    height: 40px !important;
    min-height: 40px !important;
}
.vti__dropdown {
    width: 100% !important;
    min-width: 100% !important;
    padding: 0 !important;
}
.vti__dropdown .vti__flag {
    margin-left: 10px !important;
}
.vti__dropdown .vti__dropdown-arrow {
    margin-left: 5px;
}
.vue-tel-input .vti__input {
    display: none !important;
}
.vue-tel-input .vti__dropdown .vti__dropdown-list {
    max-width: 330px !important;
}
</style>
