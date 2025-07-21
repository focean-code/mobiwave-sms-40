import React from 'react';
import { Grid, Column, Tile } from '@carbon/react';
import { 
  Chat,
  Lightning,
  Security,
  Analytics,
  Earth,
  Time
} from '@carbon/icons-react';

export const Features = () => {
  const features = [
    {
      icon: Chat,
      title: "Multi-Channel Messaging",
      description: "Send SMS, emails, and push notifications from one unified platform."
    },
    {
      icon: Lightning,
      title: "Lightning Fast",
      description: "Messages delivered instantly with our high-performance infrastructure."
    },
    {
      icon: Security,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee."
    },
    {
      icon: Analytics,
      title: "Advanced Analytics",
      description: "Track delivery rates, engagement, and campaign performance in real-time."
    },
    {
      icon: Earth,
      title: "Global Reach",
      description: "Send messages worldwide with local carrier connections."
    },
    {
      icon: Time,
      title: "Scheduled Sending",
      description: "Schedule messages for optimal delivery times across time zones."
    }
  ];

  return (
    <section id="features" className="py-16 md:py-20 bg-white">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="text-center mb-16">
            <h2 className="cds--type-display-02 carbon-text-primary mb-4">
              Everything you need to connect
            </h2>
            <p className="cds--type-expressive-heading-02 carbon-text-secondary max-w-2xl mx-auto">
              Powerful features designed to help you reach your audience effectively and efficiently.
            </p>
          </div>
        </Column>
        
        <Column lg={16} md={8} sm={4}>
          <Grid>
            {features.map((feature, index) => (
              <Column 
                key={index} 
                lg={5} 
                md={4} 
                sm={4} 
                className="mb-8"
              >
                <Tile className="h-full p-6 hover:bg-gray-50 transition-colors">
                  <feature.icon size={48} className="text-blue-600 mb-4" />
                  <h3 className="cds--type-productive-heading-02 mb-3">
                    {feature.title}
                  </h3>
                  <p className="cds--type-body-01 carbon-text-secondary">
                    {feature.description}
                  </p>
                </Tile>
              </Column>
            ))}
          </Grid>
        </Column>
      </Grid>
    </section>
  );
};
