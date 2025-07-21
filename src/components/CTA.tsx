import React from 'react';
import { Button, Grid, Column } from '@carbon/react';
import { Link } from 'react-router-dom';
import { ArrowRight } from '@carbon/icons-react';
import { useAuth } from './auth/AuthProvider';

export const CTA = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-16 md:py-20 carbon-layer">
      <Grid>
        <Column lg={16} md={8} sm={4}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="cds--type-display-02 carbon-text-primary mb-6">
              Ready to get started?
            </h2>
            <p className="cds--type-expressive-heading-02 carbon-text-secondary mb-8 max-w-2xl mx-auto">
              Join thousands of businesses already using Mobiwave to power their messaging campaigns. Start your free trial today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button
                kind="primary"
                size="lg"
                as={Link}
                to={isAuthenticated ? "/dashboard" : "/auth"}
                renderIcon={ArrowRight}
              >
                {isAuthenticated ? "Go to Dashboard" : "Start Free Trial"}
              </Button>
              <Button
                kind="secondary"
                size="lg"
                as={Link}
                to="/contact"
              >
                Contact Sales
              </Button>
            </div>
            <p className="cds--type-helper-text-01 carbon-text-secondary">
              No credit card required • Free 14-day trial • Cancel anytime
            </p>
          </div>
        </Column>
      </Grid>
    </section>
  );
};
