import type { FC } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { FirebaseAppConfig } from '@/data/apps'; // Using FirebaseAppConfig type
import Link from 'next/link';

interface AppCardProps {
  app: FirebaseAppConfig;
}

const AppCard: FC<AppCardProps> = ({ app }) => {
  const aiHint = app.dataAiHint || (app.name.toLowerCase().split(' ')[0] || 'app') + " logo";

  return (
    <Link href={app.appUrl}
      className="group block transform transition-transform duration-300 ease-in-out hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-4 focus:ring-offset-background rounded-lg"
      aria-label={`Launch ${app.name}`}
      title={`Launch ${app.name}`}>
      <Card className="h-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col items-center text-center bg-card rounded-lg border border-border hover:border-primary/50">
        <CardHeader className="pt-6 sm:pt-8 px-4 sm:px-6 pb-3 sm:pb-4 w-full flex flex-col items-center">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 mb-4 rounded-full overflow-hidden border-2 border-primary/30 shadow-md mx-auto">
            <Image
              src={app.logoUrl}
              alt={`${app.name} Logo`}
              fill={true} // Explicitly set to true for clarity
              className="rounded-full object-cover" // Add object-cover class
              data-ai-hint={aiHint}
            />
          </div>
          <CardTitle className="text-lg sm:text-xl font-semibold text-card-foreground group-hover:text-primary transition-colors duration-200">
            {app.name}
          </CardTitle>
        </CardHeader>
        {app.description && (
          <CardContent className="px-4 sm:px-6 pb-6 pt-0">
            <CardDescription className="text-sm text-muted-foreground leading-relaxed">
              {app.description}
            </CardDescription>
          </CardContent>
        )}
      </Card>
    </Link>
  );
};

export default AppCard;
