import React from 'react';
import { Grid, Column } from '@carbon/react';

export const Stats = () => {
  const stats = [
    {
      number: "10M+",
      label: "Messages Delivered",
      description: "Monthly message volume"
    },
    {
      number: "99.9%",
      label: "Uptime",
      description: "Reliable service guarantee"
    },
    {
      number: "50+",
      label: "Countries",
      description: "Global coverage"
    },
    {
      number: "24/7",
      label: "Support",
      description: "Always here to help"
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-blue-600">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="text-center mb-16">
            <h2 className="cds--type-display-02 text-white mb-4">
              Trusted by businesses worldwide
            </h2>
            <p className="cds--type-expressive-heading-02 text-blue-100 max-w-2xl mx-auto">
              Join thousands of companies using Mobiwave to power their communications.
            </p>
          </div>
        </Column>
        
        <Column lg={16} md={8} sm={4}>
          <Grid>
            {stats.map((stat, index) => (
              <Column 
                key={index} 
                lg={4} 
                md={2} 
                sm={2} 
                className="text-center mb-8 md:mb-0"
              >
                <div className="cds--type-display-03 text-white mb-2">
                  {stat.number}
                </div>
                <div className="cds--type-productive-heading-02 text-blue-100 mb-1">
                  {stat.label}
                </div>
                <div className="cds--type-body-01 text-blue-200">
                  {stat.description}
                </div>
              </Column>
            ))}
          </Grid>
        </Column>
      </Grid>
    </section>
  );
};
