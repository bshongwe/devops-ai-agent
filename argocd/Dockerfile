FROM argoproj/argocd:v2.8.4

# Switch to root to install packages
USER root

# Install additional tools for CI-CD integration
RUN apt-get update && apt-get install -y \
    curl \
    jq \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copy custom configuration
COPY argocd/standalone-config.yaml /app/config/argocd-server-config.yaml

# Copy custom UI assets
COPY argocd/mock-ui/ /shared/app/

# Switch back to argocd user
USER 999

EXPOSE 8080 8443

CMD ["argocd-server", "--staticassets", "/shared/app", "--config", "/app/config/argocd-server-config.yaml"]